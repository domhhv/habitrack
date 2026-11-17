import type { useFetchers } from 'react-router';
import { it, expect, describe } from 'vitest';

import type { OccurrenceSubmission } from '@models';

import {
  isPendingWrite,
  collectPendingHabitWrites,
  collectPendingCalendarWrites,
} from './pending-writes';

type RouterFetcher = ReturnType<typeof useFetchers>[number];

const makeFetcher = (override: Record<string, unknown>) => {
  return {
    data: undefined,
    formAction: undefined,
    formData: undefined,
    formEncType: undefined,
    formMethod: 'POST',
    json: undefined,
    key: 'fetcher-1',
    state: 'submitting',
    text: undefined,
    ...override,
  } as unknown as RouterFetcher;
};

const makeFormData = (fields: Record<string, string>) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([name, value]) => {
    formData.set(name, value);
  });

  return formData;
};

const occurrenceFetcher = (json: OccurrenceSubmission, key = 'fetcher-1') => {
  return makeFetcher({ formAction: '/resources/occurrences', json, key });
};

const values = {
  depletedStockIds: [],
  hasSpecificTime: true,
  metricValues: {},
  note: '',
  occurredAt: '2026-10-22T08:00:00.000Z',
  selectedHabitId: 'habit-1',
  stockUsages: [],
};

describe(isPendingWrite.name, () => {
  it('treats submitting and revalidating writes as pending', () => {
    const formData = makeFormData({ intent: 'delete' });

    expect(isPendingWrite(makeFetcher({ formData }))).toBe(true);
    expect(
      isPendingWrite(
        makeFetcher({ data: { ok: true }, formData, state: 'loading' })
      )
    ).toBe(true);
  });

  it('ignores idle fetchers, loads and failed writes', () => {
    const formData = makeFormData({ intent: 'delete' });

    expect(isPendingWrite(makeFetcher({ formData, state: 'idle' }))).toBe(
      false
    );
    expect(isPendingWrite(makeFetcher({ formMethod: 'GET' }))).toBe(false);
    expect(
      isPendingWrite(
        makeFetcher({ data: { ok: false }, formData, state: 'loading' })
      )
    ).toBe(false);
  });
});

describe(collectPendingCalendarWrites.name, () => {
  it('returns null without calendar writes', () => {
    expect(
      collectPendingCalendarWrites([
        makeFetcher({
          formAction: '/habits/habit-1',
          formData: makeFormData({ intent: 'delete-habit' }),
        }),
      ])
    ).toBeNull();
  });

  it('collects occurrence writes from JSON submissions', () => {
    const writes = collectPendingCalendarWrites([
      occurrenceFetcher(
        { intent: 'create', photoPaths: ['a.jpg'], values },
        'create-key'
      ),
      occurrenceFetcher({
        intent: 'update',
        noteId: null,
        occurrenceId: 'occurrence-1',
        photoPaths: [],
        values,
      }),
      occurrenceFetcher({ intent: 'delete', occurrenceId: 'occurrence-2' }),
      occurrenceFetcher({
        habitMetricId: 'metric-1',
        intent: 'remove-metric-value',
        occurrenceId: 'occurrence-3',
      }),
      occurrenceFetcher({
        intent: 'remove-photo',
        occurrenceId: 'occurrence-4',
        photoPath: 'b.jpg',
      }),
    ]);

    expect(writes).toMatchObject({
      deletedOccurrenceIds: ['occurrence-2'],
      updatedOccurrences: [{ occurrenceId: 'occurrence-1' }],
      createdOccurrences: [
        { id: 'pending-create-key', photoPaths: ['a.jpg'], values },
      ],
      removedMetricValues: [
        { habitMetricId: 'metric-1', occurrenceId: 'occurrence-3' },
      ],
    });
  });

  it('collects note writes from form fields and skips blank content', () => {
    const noteFetcher = (fields: Record<string, string>, key = 'note') => {
      return makeFetcher({
        formAction: '/resources/notes',
        formData: makeFormData(fields),
        key,
      });
    };

    const writes = collectPendingCalendarWrites([
      noteFetcher(
        {
          content: ' Good week ',
          intent: 'create',
          periodDate: '2026-10-19',
          periodKind: 'week',
        },
        'week-note'
      ),
      noteFetcher({ content: 'Edited', intent: 'update', noteId: 'note-1' }),
      noteFetcher({ content: '  ', intent: 'update', noteId: 'note-2' }),
      noteFetcher({ intent: 'delete', noteId: 'note-3' }),
    ]);

    expect(writes).toMatchObject({
      deletedNoteIds: ['note-3'],
      updatedNotes: [{ content: 'Edited', noteId: 'note-1' }],
      createdNotes: [
        {
          content: 'Good week',
          id: 'pending-week-note',
          periodDate: '2026-10-19',
          periodKind: 'week',
        },
      ],
    });
  });
});

describe(collectPendingHabitWrites.name, () => {
  it('collects habit deletions and stock changes by habit route', () => {
    const habitFetcher = (fields: Record<string, string>) => {
      return makeFetcher({
        formAction: '/habits/habit-1',
        formData: makeFormData(fields),
      });
    };

    expect(
      collectPendingHabitWrites([
        habitFetcher({ intent: 'delete-habit' }),
        habitFetcher({ intent: 'remove-stock', stockId: 'stock-1' }),
        habitFetcher({
          intent: 'set-stock-depleted',
          isDepleted: 'true',
          stockId: 'stock-2',
        }),
        habitFetcher({ intent: 'update-habit', name: 'Renamed' }),
      ])
    ).toEqual({
      deletedHabitIds: ['habit-1'],
      removedStockIds: ['stock-1'],
      stockDepletion: { 'stock-2': true },
    });
  });
});
