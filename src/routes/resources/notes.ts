import { data } from 'react-router';

import type { NoteSubmission, NotePeriodKind } from '@models';
import {
  createNote,
  updateNote,
  destroyNote,
  getPeriodNote,
  invalidateCalendarNotes,
} from '@services';
import { refreshStoreNotesList } from '@stores';
import { runAction, userContext } from '@utils';

import type { Route } from './+types/notes';

const PERIOD_KINDS: NonNullable<NotePeriodKind>[] = ['day', 'week', 'month'];

const invalidateNotes = () => {
  invalidateCalendarNotes();
  refreshStoreNotesList();
};

export const clientLoader = async ({
  context,
  request,
}: Route.ClientLoaderArgs) => {
  const { searchParams } = new URL(request.url);
  const periodDate = searchParams.get('date');
  const periodKind = PERIOD_KINDS.find((kind) => {
    return kind === searchParams.get('kind');
  });

  if (!context.get(userContext) || !periodDate || !periodKind) {
    return { note: null };
  }

  return { note: await getPeriodNote(periodKind, periodDate) };
};

export const clientAction = async ({
  context,
  request,
}: Route.ClientActionArgs) => {
  const user = context.get(userContext);

  if (!user) {
    return data(
      { error: 'Please log in to your account first', ok: false as const },
      { status: 401 }
    );
  }

  const submission = (await request.json()) as NoteSubmission;

  switch (submission.intent) {
    case 'create':
      return runAction(
        createNote({ ...submission.note, userId: user.id }).finally(
          invalidateNotes
        ),
        'add_note'
      );

    case 'delete':
      return runAction(
        destroyNote(submission.noteId).finally(invalidateNotes),
        'remove_note'
      );

    case 'update':
      return runAction(
        updateNote(submission.noteId, submission.note).finally(invalidateNotes),
        'update_note'
      );
  }
};
