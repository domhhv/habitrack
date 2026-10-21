import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { OccurrenceSubmission, OccurrenceValuesSubmission } from '@models';
import {
  getHabit,
  createNote,
  updateNote,
  patchStock,
  uploadImages,
  getOccurrence,
  patchOccurrence,
  createOccurrence,
  destroyOccurrence,
  destroyMetricValue,
  upsertMetricValues,
  updateOccurrenceStockUsage,
  createOccurrenceStockUsages,
  deleteOccurrenceStockUsages,
} from '@services';
import { makeRouteArgs } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/occurrences';
import { clientAction } from './occurrences';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    createNote: vi.fn(),
    createOccurrence: vi.fn(),
    createOccurrenceStockUsages: vi.fn(),
    deleteOccurrenceStockUsages: vi.fn(),
    destroyMetricValue: vi.fn(),
    destroyOccurrence: vi.fn(),
    getHabit: vi.fn(),
    getOccurrence: vi.fn(),
    patchOccurrence: vi.fn(),
    patchStock: vi.fn(),
    updateNote: vi.fn(),
    updateOccurrenceStockUsage: vi.fn(),
    uploadImages: vi.fn(),
    upsertMetricValues: vi.fn(),
  };
});

const RESOURCE_URL = 'http://localhost/resources/occurrences';
const user = { id: 'user-1' } as SessionUser;

const values: OccurrenceValuesSubmission = {
  depletedStockIds: ['stock-1'],
  hasSpecificTime: true,
  metricValues: { 'metric-1': { numericValue: 3 } },
  note: 'Felt great',
  occurredAt: '2026-10-22T08:00:00.000Z',
  selectedHabitId: 'habit-1',
  stockUsages: [
    { habitStockId: 'stock-1', quantity: 2 },
    { habitStockId: 'stock-3', quantity: 1 },
  ],
};

const submitForm = (fields: Record<string, string>) => {
  const body = new FormData();

  Object.entries(fields).forEach(([name, value]) => {
    body.set(name, value);
  });
  body.set('values', JSON.stringify(values));
  body.append('photos', new File(['photo'], 'photo.jpg'));

  return clientAction({
    ...makeRouteArgs<Route.ClientActionArgs>(RESOURCE_URL, user),
    request: {
      headers: new Headers(),
      formData: () => {
        return Promise.resolve(body);
      },
    } as unknown as Request,
  });
};

const submitJson = (submission: OccurrenceSubmission, sessionUser = user) => {
  return clientAction(
    makeRouteArgs<Route.ClientActionArgs>(RESOURCE_URL, sessionUser, {
      body: JSON.stringify(submission),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
  );
};

describe('occurrences resource clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(uploadImages).mockResolvedValue(['user-1/habit-1/new.jpg']);
    vi.mocked(getHabit).mockResolvedValue({
      stocks: [{ cost: 10, currency: 'EUR', id: 'stock-1', totalItems: 5 }],
    } as Awaited<ReturnType<typeof getHabit>>);
    vi.mocked(createNote).mockResolvedValue({ id: 'note-1' } as Awaited<
      ReturnType<typeof createNote>
    >);
    vi.mocked(updateNote).mockResolvedValue({ id: 'note-1' } as Awaited<
      ReturnType<typeof updateNote>
    >);
  });

  it('rejects signed-out users', async () => {
    await expect(
      submitJson({ intent: 'delete', occurrenceId: 'occurrence-1' }, null)
    ).resolves.toMatchObject({ init: { status: 401 } });
    expect(destroyOccurrence).not.toHaveBeenCalled();
  });

  it('creates an occurrence with photos, cost, note, metrics, and stock usages', async () => {
    vi.mocked(createOccurrence).mockResolvedValue({
      id: 'occurrence-1',
    } as Awaited<ReturnType<typeof createOccurrence>>);

    await expect(submitForm({ intent: 'create' })).resolves.toEqual({
      ok: true,
    });
    expect(createOccurrence).toHaveBeenCalledWith(
      expect.objectContaining({
        cost: 4,
        currency: 'EUR',
        habitId: 'habit-1',
        photoPaths: ['user-1/habit-1/new.jpg'],
        userId: 'user-1',
      })
    );
    expect(createNote).toHaveBeenCalledWith({
      content: 'Felt great',
      occurrenceId: 'occurrence-1',
      userId: 'user-1',
    });
    expect(upsertMetricValues).toHaveBeenCalledWith([
      {
        habitMetricId: 'metric-1',
        occurrenceId: 'occurrence-1',
        userId: 'user-1',
        value: { numericValue: 3 },
      },
    ]);
    expect(createOccurrenceStockUsages).toHaveBeenCalledWith([
      expect.objectContaining({ habitStockId: 'stock-1', quantity: 2 }),
      expect.objectContaining({ habitStockId: 'stock-3', quantity: 1 }),
    ]);
    expect(patchStock).toHaveBeenCalledWith('stock-1', { isDepleted: true });
  });

  it('updates an occurrence and syncs its stock usages and note', async () => {
    vi.mocked(getOccurrence).mockResolvedValue({
      id: 'occurrence-1',
      photoPaths: ['user-1/habit-1/old.jpg'],
      stockUsages: [
        { habitStockId: 'stock-1', id: 'usage-1', quantity: 1 },
        { habitStockId: 'stock-2', id: 'usage-2', quantity: 1 },
      ],
    } as Awaited<ReturnType<typeof getOccurrence>>);

    await expect(
      submitForm({
        intent: 'update',
        noteId: 'note-1',
        occurrenceId: 'occurrence-1',
      })
    ).resolves.toEqual({ ok: true });
    expect(deleteOccurrenceStockUsages).toHaveBeenCalledWith(['usage-2']);
    expect(updateOccurrenceStockUsage).toHaveBeenCalledWith('usage-1', {
      quantity: 2,
    });
    expect(createOccurrenceStockUsages).toHaveBeenCalledWith([
      expect.objectContaining({ habitStockId: 'stock-3' }),
    ]);
    expect(patchOccurrence).toHaveBeenCalledWith(
      'occurrence-1',
      expect.objectContaining({
        photoPaths: ['user-1/habit-1/old.jpg', 'user-1/habit-1/new.jpg'],
      })
    );
    expect(updateNote).toHaveBeenCalledWith('note-1', {
      content: 'Felt great',
      occurrenceId: 'occurrence-1',
    });
  });

  it('fails the update when the occurrence no longer exists', async () => {
    vi.mocked(getOccurrence).mockResolvedValue(null);

    await expect(
      submitForm({ intent: 'update', occurrenceId: 'missing' })
    ).resolves.toEqual({ error: 'This entry no longer exists', ok: false });
    expect(patchOccurrence).not.toHaveBeenCalled();
  });

  it('deletes the occurrence with its photos', async () => {
    const occurrence = { id: 'occurrence-1', photoPaths: ['photo.jpg'] };
    vi.mocked(getOccurrence).mockResolvedValue(
      occurrence as Awaited<ReturnType<typeof getOccurrence>>
    );

    await submitJson({ intent: 'delete', occurrenceId: 'occurrence-1' });

    expect(destroyOccurrence).toHaveBeenCalledWith(occurrence);
  });

  it('removes a metric value', async () => {
    vi.mocked(destroyMetricValue).mockResolvedValue(undefined);

    await submitJson({
      habitMetricId: 'metric-1',
      intent: 'remove-metric-value',
      occurrenceId: 'occurrence-1',
    });

    expect(destroyMetricValue).toHaveBeenCalledWith('occurrence-1', 'metric-1');
  });

  it('drops a deleted photo from the occurrence', async () => {
    vi.mocked(getOccurrence).mockResolvedValue({
      photoPaths: ['keep.jpg', 'drop.jpg'],
    } as Awaited<ReturnType<typeof getOccurrence>>);

    await expect(
      submitJson({
        intent: 'remove-photo',
        occurrenceId: 'occurrence-1',
        photoPath: 'drop.jpg',
      })
    ).resolves.toEqual({ ok: true });
    expect(patchOccurrence).toHaveBeenCalledWith('occurrence-1', {
      photoPaths: ['keep.jpg'],
    });
  });
});
