import React from 'react';

import { NotesList } from '@components';
import { ErrorFallbackPage } from '@pages';
import { listAllNotes } from '@services';
import { userContext } from '@utils';

import type { Route } from './+types/NotesPage';

const NOTES_PAGE_SIZE = 20;

export const clientLoader = async ({
  context,
  request,
}: Route.ClientLoaderArgs) => {
  const pageCount = Math.max(
    1,
    Math.floor(Number(new URL(request.url).searchParams.get('pages')) || 1)
  );

  if (!context.get(userContext)) {
    return { hasMore: false, notes: [], pageCount };
  }

  const notes = await listAllNotes({
    limit: NOTES_PAGE_SIZE * pageCount,
    page: 0,
  });

  return {
    hasMore: notes.length === NOTES_PAGE_SIZE * pageCount,
    notes,
    pageCount,
  };
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
