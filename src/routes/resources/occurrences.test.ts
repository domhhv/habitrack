import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { OccurrenceSubmission, OccurrenceValuesSubmission } from '@models';
import {
  getHabit,
  createNote,
  updateNote,
  patchStock,
  getOccurrence,
  patchOccurrence,
  createOccurrence,
  clearCalendarData,
  destroyOccurrence,
  destroyMetricValue,
  upsertMetricValues,
  addOccurrencePhotoPaths,
  removeOccurrencePhotoPath,
  updateOccurrenceStockUsage,
  createOccurrenceStockUsages,
  deleteOccurrenceStockUsages,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/occurrences';
import { action, clientAction } from './occurrences';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    addOccurrencePhotoPaths: vi.fn(),
    clearCalendarData: vi.fn(),
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
    removeOccurrencePhotoPath: vi.fn(),
    updateNote: vi.fn(),
    updateOccurrenceStockUsage: vi.fn(),
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

const submit = (submission: OccurrenceSubmission, sessionUser = user) => {
  return action(
    makeRouteArgs<Route.ActionArgs>(RESOURCE_URL, sessionUser, {
      body: JSON.stringify(submission),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'tz=Europe%2FBerlin',
      },
    })
  );
};

const newPhotoPaths = ['user-1/habit-1/new.jpg'];

describe('occurrences resource action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      submit({ intent: 'delete', occurrenceId: 'occurrence-1' }, null)
    ).resolves.toMatchObject({ init: { status: 401 } });
    expect(destroyOccurrence).not.toHaveBeenCalled();
  });

  it('creates an occurrence with photos, cost, note, metrics, and stock usages', async () => {
    vi.mocked(createOccurrence).mockResolvedValue({
      id: 'occurrence-1',
    } as Awaited<ReturnType<typeof createOccurrence>>);

    await expect(
      submit({ intent: 'create', photoPaths: newPhotoPaths, values })
    ).resolves.toEqual({
      ok: true,
      toasts: [{ title: 'Occurrence added', variant: 'success' }],
    });
    expect(createOccurrence).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.objectContaining({
        cost: 4,
        currency: 'EUR',
        habitId: 'habit-1',
        photoPaths: newPhotoPaths,
        timeZone: 'Europe/Berlin',
        userId: 'user-1',
      })
    );
    expect(createNote).toHaveBeenCalledWith(testSupabaseClient, {
      content: 'Felt great',
      occurrenceId: 'occurrence-1',
      userId: 'user-1',
    });
    expect(upsertMetricValues).toHaveBeenCalledWith(testSupabaseClient, [
      {
        habitMetricId: 'metric-1',
        occurrenceId: 'occurrence-1',
        userId: 'user-1',
        value: { numericValue: 3 },
      },
    ]);
    expect(createOccurrenceStockUsages).toHaveBeenCalledWith(
      testSupabaseClient,
      [
        expect.objectContaining({ habitStockId: 'stock-1', quantity: 2 }),
        expect.objectContaining({ habitStockId: 'stock-3', quantity: 1 }),
      ]
    );
    expect(patchStock).toHaveBeenCalledWith(testSupabaseClient, 'stock-1', {
      isDepleted: true,
    });
  });

  it('saves an entry without photos', async () => {
    vi.mocked(createOccurrence).mockResolvedValue({
      id: 'occurrence-1',
    } as Awaited<ReturnType<typeof createOccurrence>>);

    await submit({ intent: 'create', photoPaths: [], values });

    expect(createOccurrence).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.objectContaining({ photoPaths: null })
    );
  });

  it("rejects photo paths outside the user's folder before writing", async () => {
    await expect(
      submit({
        intent: 'create',
        photoPaths: ['user-2/habit-1/theirs.jpg'],
        values,
      })
    ).resolves.toMatchObject({
      error: 'Some photos could not be attached to this entry',
      ok: false,
    });
    expect(createOccurrence).not.toHaveBeenCalled();
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
      submit({
        intent: 'update',
        noteId: 'note-1',
        occurrenceId: 'occurrence-1',
        photoPaths: newPhotoPaths,
        values,
      })
    ).resolves.toMatchObject({ ok: true });
    expect(deleteOccurrenceStockUsages).toHaveBeenCalledWith(
      testSupabaseClient,
      ['usage-2']
    );
    expect(updateOccurrenceStockUsage).toHaveBeenCalledWith(
      testSupabaseClient,
      'usage-1',
      {
        quantity: 2,
      }
    );
    expect(createOccurrenceStockUsages).toHaveBeenCalledWith(
      testSupabaseClient,
      [expect.objectContaining({ habitStockId: 'stock-3' })]
    );
    expect(patchOccurrence).toHaveBeenCalledWith(
      testSupabaseClient,
      'occurrence-1',
      expect.any(Object)
    );
    vi.mocked(patchOccurrence).mock.calls.forEach(([, , changes]) => {
      expect(changes).not.toHaveProperty('photoPaths');
    });
    expect(addOccurrencePhotoPaths).toHaveBeenCalledWith(
      testSupabaseClient,
      'occurrence-1',
      newPhotoPaths
    );
    expect(updateNote).toHaveBeenCalledWith(testSupabaseClient, 'note-1', {
      content: 'Felt great',
      occurrenceId: 'occurrence-1',
    });
  });

  it('fails the update when the occurrence no longer exists', async () => {
    vi.mocked(getOccurrence).mockResolvedValue(null);

    await expect(
      submit({
        intent: 'update',
        noteId: null,
        occurrenceId: 'missing',
        photoPaths: [],
        values,
      })
    ).resolves.toMatchObject({
      error: 'This entry no longer exists',
      ok: false,
    });
    expect(patchOccurrence).not.toHaveBeenCalled();
  });

  it('deletes the occurrence with its photos', async () => {
    const occurrence = { id: 'occurrence-1', photoPaths: ['photo.jpg'] };
    vi.mocked(getOccurrence).mockResolvedValue(
      occurrence as Awaited<ReturnType<typeof getOccurrence>>
    );

    await submit({ intent: 'delete', occurrenceId: 'occurrence-1' });

    expect(destroyOccurrence).toHaveBeenCalledWith(
      testSupabaseClient,
      occurrence
    );
  });

  it('removes a metric value', async () => {
    vi.mocked(destroyMetricValue).mockResolvedValue(undefined);

    await submit({
      habitMetricId: 'metric-1',
      intent: 'remove-metric-value',
      occurrenceId: 'occurrence-1',
    });

    expect(destroyMetricValue).toHaveBeenCalledWith(
      testSupabaseClient,
      'occurrence-1',
      'metric-1'
    );
  });

  it('drops a deleted photo from the occurrence in one write', async () => {
    await expect(
      submit({
        intent: 'remove-photo',
        occurrenceId: 'occurrence-1',
        photoPath: 'user-1/habit-1/drop.jpg',
      })
    ).resolves.toEqual({ ok: true });
    expect(removeOccurrencePhotoPath).toHaveBeenCalledWith(
      testSupabaseClient,
      'occurrence-1',
      'user-1/habit-1/drop.jpg'
    );
    expect(patchOccurrence).not.toHaveBeenCalled();
  });

  it('returns the failure of a later step with its toast', async () => {
    vi.mocked(createOccurrence).mockResolvedValue({
      id: 'occurrence-1',
    } as Awaited<ReturnType<typeof createOccurrence>>);
    vi.mocked(upsertMetricValues).mockRejectedValue(new Error('Bad metric'));

    await expect(
      submit({ intent: 'create', photoPaths: [], values })
    ).resolves.toMatchObject({
      error: 'Bad metric',
      ok: false,
      toasts: [expect.objectContaining({ variant: 'danger' })],
    });
  });
});

describe('occurrences resource clientAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears the browser calendar cache after the server action', async () => {
    const result = { ok: true as const, toasts: [] };

    await expect(
      clientAction({
        ...makeRouteArgs<Route.ClientActionArgs>(RESOURCE_URL, user),
        serverAction: vi.fn().mockResolvedValue(result),
      })
    ).resolves.toBe(result);
    expect(clearCalendarData).toHaveBeenCalledOnce();
  });

  it('clears the cache even when the server action throws', async () => {
    await expect(
      clientAction({
        ...makeRouteArgs<Route.ClientActionArgs>(RESOURCE_URL, user),
        serverAction: vi.fn().mockRejectedValue(new Error('Offline')),
      })
    ).rejects.toThrow('Offline');
    expect(clearCalendarData).toHaveBeenCalledOnce();
  });
});
