import { data } from 'react-router';

import type { NoteSubmission, NotePeriodKind } from '@models';
import {
  createNote,
  updateNote,
  destroyNote,
  getPeriodNote,
  invalidateCalendarNotes,
} from '@services';
import { runAction, userContext, supabaseContext } from '@utils';

import type { Route } from './+types/notes';

const PERIOD_KINDS: NonNullable<NotePeriodKind>[] = ['day', 'week', 'month'];

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

  return {
    note: await getPeriodNote(
      context.get(supabaseContext),
      periodKind,
      periodDate
    ),
  };
};

export const clientAction = async ({
  context,
  request,
}: Route.ClientActionArgs) => {
  const supabase = context.get(supabaseContext);
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
        createNote(supabase, { ...submission.note, userId: user.id }).finally(
          invalidateCalendarNotes
        ),
        'add_note'
      );

    case 'delete':
      return runAction(
        destroyNote(supabase, submission.noteId).finally(
          invalidateCalendarNotes
        ),
        'remove_note'
      );

    case 'update':
      return runAction(
        updateNote(supabase, submission.noteId, submission.note).finally(
          invalidateCalendarNotes
        ),
        'update_note'
      );
  }
};
