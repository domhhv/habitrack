import { href, matchPath, type useFetchers } from 'react-router';

import type {
  NotePeriodKind,
  PendingHabitWrites,
  OccurrenceSubmission,
  PendingCalendarWrites,
} from '@models';

import getFormText from './get-form-text';

type RouterFetcher = ReturnType<typeof useFetchers>[number];

const NOTE_PERIOD_KINDS: NonNullable<NotePeriodKind>[] = [
  'day',
  'week',
  'month',
];

const isFailedResult = (data: unknown) => {
  return typeof data === 'object' && data !== null && 'ok' in data && !data.ok;
};

const getActionPath = (fetcher: RouterFetcher) => {
  return fetcher.formAction?.split('?')[0];
};

/**
 * A write stays pending while its fetcher submits and while the loaders revalidate afterwards,
 * unless the action already reported a failure.
 */
export const isPendingWrite = (fetcher: RouterFetcher) => {
  return (
    fetcher.state !== 'idle' &&
    (fetcher.formData !== undefined || fetcher.json !== undefined) &&
    !isFailedResult(fetcher.data)
  );
};

export const getPendingId = (fetcherKey: string) => {
  return `pending-${fetcherKey}`;
};

const collectOccurrenceWrite = (
  writes: PendingCalendarWrites,
  fetcher: RouterFetcher
) => {
  if (typeof fetcher.json !== 'object' || fetcher.json === null) {
    return;
  }

  const submission = fetcher.json as OccurrenceSubmission;

  switch (submission.intent) {
    case 'create':
      writes.createdOccurrences.push({
        id: getPendingId(fetcher.key),
        photoPaths: submission.photoPaths,
        values: submission.values,
      });
      break;

    case 'update':
      writes.updatedOccurrences.push({
        noteId: submission.noteId,
        occurrenceId: submission.occurrenceId,
        photoPaths: submission.photoPaths,
        values: submission.values,
      });
      break;

    case 'delete':
      writes.deletedOccurrenceIds.push(submission.occurrenceId);
      break;

    case 'remove-metric-value':
      writes.removedMetricValues.push({
        habitMetricId: submission.habitMetricId,
        occurrenceId: submission.occurrenceId,
      });
      break;

    default:
      break;
  }
};

const collectNoteWrite = (
  writes: PendingCalendarWrites,
  fetcher: RouterFetcher
) => {
  if (!fetcher.formData) {
    return;
  }

  const content = getFormText(fetcher.formData, 'content');
  const noteId = getFormText(fetcher.formData, 'noteId');
  const periodKind = NOTE_PERIOD_KINDS.find((kind) => {
    return kind === fetcher.formData?.get('periodKind');
  });

  switch (fetcher.formData.get('intent')) {
    case 'create':
      if (content && periodKind) {
        writes.createdNotes.push({
          content,
          id: getPendingId(fetcher.key),
          periodDate: getFormText(fetcher.formData, 'periodDate'),
          periodKind,
        });
      }

      break;

    case 'update':
      if (content && noteId) {
        writes.updatedNotes.push({ content, noteId });
      }

      break;

    case 'delete':
      if (noteId) {
        writes.deletedNoteIds.push(noteId);
      }

      break;

    default:
      break;
  }
};

export const collectPendingCalendarWrites = (
  fetchers: RouterFetcher[]
): PendingCalendarWrites | null => {
  const writes: PendingCalendarWrites = {
    createdNotes: [],
    createdOccurrences: [],
    deletedNoteIds: [],
    deletedOccurrenceIds: [],
    removedMetricValues: [],
    updatedNotes: [],
    updatedOccurrences: [],
  };

  fetchers.filter(isPendingWrite).forEach((fetcher) => {
    const actionPath = getActionPath(fetcher);

    if (actionPath === href('/resources/occurrences')) {
      collectOccurrenceWrite(writes, fetcher);
    }

    if (actionPath === href('/resources/notes')) {
      collectNoteWrite(writes, fetcher);
    }
  });

  const hasWrites = Object.values(writes).some((list) => {
    return list.length > 0;
  });

  return hasWrites ? writes : null;
};

export const collectPendingHabitWrites = (
  fetchers: RouterFetcher[]
): PendingHabitWrites => {
  const writes: PendingHabitWrites = {
    deletedHabitIds: [],
    removedStockIds: [],
    stockDepletion: {},
  };

  fetchers.filter(isPendingWrite).forEach((fetcher) => {
    const actionPath = getActionPath(fetcher);
    const habitId =
      actionPath && matchPath('/habits/:habitId', actionPath)?.params.habitId;

    if (!habitId || !fetcher.formData) {
      return;
    }

    const stockId = getFormText(fetcher.formData, 'stockId');

    switch (fetcher.formData.get('intent')) {
      case 'delete-habit':
        writes.deletedHabitIds.push(habitId);
        break;

      case 'remove-stock':
        if (stockId) {
          writes.removedStockIds.push(stockId);
        }

        break;

      case 'set-stock-depleted':
        if (stockId) {
          writes.stockDepletion[stockId] =
            fetcher.formData.get('isDepleted') === 'true';
        }

        break;

      default:
        break;
    }
  });

  return writes;
};
