import { data } from 'react-router';

import type { FieldErrors, NotePeriodKind, TypedSupabaseClient } from '@models';
import {
  createNote,
  updateNote,
  destroyNote,
  getPeriodNote,
  invalidateCalendarNotes,
} from '@services';
import {
  runAction,
  getFormText,
  userContext,
  supabaseContext,
  assertValidFields,
} from '@utils';

import type { Route } from './+types/notes';

const PERIOD_KINDS: NonNullable<NotePeriodKind>[] = ['day', 'week', 'month'];
const PERIOD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The period comes from hidden fields, so a bad one fails the whole submission, while a blank note
 * is reported next to the text area.
 */
const getPeriodNoteFields = (formData: FormData) => {
  const content = getFormText(formData, 'content');
  const periodDate = getFormText(formData, 'periodDate');
  const periodKind = PERIOD_KINDS.find((kind) => {
    return kind === formData.get('periodKind');
  });
  const fieldErrors: FieldErrors = {};

  if (!periodKind || !PERIOD_DATE_PATTERN.test(periodDate)) {
    throw new Error('This note is not attached to a valid day, week or month');
  }

  if (!content) {
    fieldErrors.content = 'Write something before saving the note';
  }

  assertValidFields(fieldErrors);

  return { content, periodDate, periodKind };
};

const addNote = async (
  supabase: TypedSupabaseClient,
  formData: FormData,
  userId: string
) => {
  await createNote(supabase, { ...getPeriodNoteFields(formData), userId });
};

const editNote = async (
  supabase: TypedSupabaseClient,
  formData: FormData,
  noteId: string
) => {
  await updateNote(supabase, noteId, getPeriodNoteFields(formData));
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

  return {
    note: await getPeriodNote(
      context.get(supabaseContext),
      periodKind,
      periodDate
    ),
  };
};

export const action = async ({ context, request }: Route.ActionArgs) => {
  const supabase = context.get(supabaseContext);
  const user = context.get(userContext);

  if (!user) {
    return data(
      { error: 'Please log in to your account first', ok: false as const },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const noteId = getFormText(formData, 'noteId');

  switch (formData.get('intent')) {
    case 'create':
      return runAction(addNote(supabase, formData, user.id), 'add_note');

    case 'delete':
      return noteId
        ? runAction(destroyNote(supabase, noteId), 'remove_note')
        : data(
            { error: 'Choose a note to remove', ok: false as const },
            { status: 400 }
          );

    case 'update':
      return noteId
        ? runAction(editNote(supabase, formData, noteId), 'update_note')
        : data(
            { error: 'Choose a note to update', ok: false as const },
            { status: 400 }
          );

    default:
      return data(
        { error: 'Unsupported note request', ok: false as const },
        { status: 400 }
      );
  }
};

export const clientAction = async ({
  serverAction,
}: Route.ClientActionArgs) => {
  try {
    return await serverAction();
  } finally {
    invalidateCalendarNotes();
  }
};
