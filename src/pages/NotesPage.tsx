import React from 'react';

import { NotesList } from '@components';
import { ErrorFallbackPage } from '@pages';
import { listNotesPage } from '@services';
import {
  userContext,
  supabaseContext,
  parseNotesCursor,
  encodeNotesCursor,
} from '@utils';

import type { Route } from './+types/NotesPage';

const NOTES_PAGE_SIZE = 20;

export const loader = async ({ context, request }: Route.LoaderArgs) => {
  const user = context.get(userContext);

  if (!user) {
    return { nextCursor: null, notes: [] };
  }

  const { nextCursor, notes } = await listNotesPage(
    context.get(supabaseContext),
    {
      before: parseNotesCursor(new URL(request.url).searchParams.get('before')),
      limit: NOTES_PAGE_SIZE,
      signal: request.signal,
      userId: user.id,
    }
  );

  return { nextCursor: nextCursor && encodeNotesCursor(nextCursor), notes };
};

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => {
  return (
    <ErrorFallbackPage
      error={error instanceof Error ? error : null}
      title="We couldn't load your notes. Please try reloading the page."
    />
  );
};

const NotesPage = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div className="mx-auto w-7xl max-w-full">
      <title>My Notes | Habitrack</title>
      <div className="mt-8 h-[calc(100vh-96px)]">
        <h1 className="text-center text-3xl font-bold text-gray-800 dark:text-gray-300">
          Your Notes
        </h1>
        <NotesList {...loaderData} />
      </div>
    </div>
  );
};

export default NotesPage;
