import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { OccurrenceSubmission, OccurrenceValuesSubmission } from '@models';
import {
  getHabit,
  getOccurrence,
  saveOccurrence,
  clearCalendarData,
  destroyOccurrence,
  destroyMetricValue,
  removeOccurrencePhotoPath,
} from '@services';
import { makeRouteArgs, testSupabaseClient } from '@tests';
import type { SessionUser } from '@utils';

import type { Route } from './+types/occurrences';
import { action, clientAction } from './occurrences';

vi.mock('@services', async (importOriginal) => {
  return {
    ...(await importOriginal<object>()),
    clearCalendarData: vi.fn(),
    destroyMetricValue: vi.fn(),
    destroyOccurrence: vi.fn(),
    getHabit: vi.fn(),
    getOccurrence: vi.fn(),
    removeOccurrencePhotoPath: vi.fn(),
    saveOccurrence: vi.fn(),
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
    vi.mocked(saveOccurrence).mockResolvedValue('occurrence-1');
  });

  it('rejects signed-out users', async () => {
    await expect(
      submit({ intent: 'delete', occurrenceId: 'occurrence-1' }, null)
    ).resolves.toMatchObject({ init: { status: 401 } });
    expect(destroyOccurrence).not.toHaveBeenCalled();
  });

  it('creates an occurrence with its photos, cost, note, metrics, and stock usages in one call', async () => {
    await expect(
      submit({ intent: 'create', photoPaths: newPhotoPaths, values })
    ).resolves.toEqual({
      ok: true,
      toasts: [{ title: 'Occurrence added', variant: 'success' }],
    });
    expect(saveOccurrence).toHaveBeenCalledOnce();
    expect(saveOccurrence).toHaveBeenCalledWith(testSupabaseClient, {
      depletedStockIds: ['stock-1'],
      metricValues: { 'metric-1': { numericValue: 3 } },
      note: 'Felt great',
      photoPaths: newPhotoPaths,
      stockUsages: values.stockUsages,
      occurrence: {
        cost: 4,
        currency: 'EUR',
        habitId: 'habit-1',
        hasSpecificTime: true,
        occurredAt: '2026-10-22T08:00:00.000Z',
        timeZone: 'Europe/Berlin',
      },
    });
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
    expect(saveOccurrence).not.toHaveBeenCalled();
  });

  it('updates an occurrence in one call, keeping its time zone', async () => {
    await expect(
      submit({
        intent: 'update',
        noteId: 'note-1',
        occurrenceId: 'occurrence-1',
        photoPaths: newPhotoPaths,
        values,
      })
    ).resolves.toMatchObject({ ok: true });
    expect(saveOccurrence).toHaveBeenCalledOnce();
    expect(saveOccurrence).toHaveBeenCalledWith(
      testSupabaseClient,
      expect.objectContaining({
        note: 'Felt great',
        occurrenceId: 'occurrence-1',
        photoPaths: newPhotoPaths,
        stockUsages: values.stockUsages,
      })
    );
    expect(
      vi.mocked(saveOccurrence).mock.calls[0][1].occurrence
    ).not.toHaveProperty('timeZone');
  });

  it('returns the failure of the save with its toast', async () => {
    vi.mocked(saveOccurrence).mockRejectedValue(
      new Error('This entry no longer exists')
    );

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
      toasts: [expect.objectContaining({ variant: 'danger' })],
    });
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
    expect(saveOccurrence).not.toHaveBeenCalled();
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
