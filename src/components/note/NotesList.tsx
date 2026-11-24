import { ScrollShadow } from '@heroui/react';
import React, { ViewTransition } from 'react';
import { href, useFetcher } from 'react-router';

import { NoteListItem, InfinityLoader } from '@components';
import type { NoteWithHabit } from '@models';

type NotesPageData = {
  nextCursor: string | null;
  notes: NoteWithHabit[];
};

type NotesListTailProps = {
  depth: number;
  isEmpty: boolean;
  nextCursor: string | null;
  requestedPages: number;
};

type NotesListPageProps = {
  before: string;
  depth: number;
  requestedPages: number;
};

const NotesListLoader = () => {
  return (
    <div className="flex justify-center py-4">
      <InfinityLoader color="var(--accent)" />
    </div>
  );
};

const NotesListItems = ({ notes }: Pick<NotesPageData, 'notes'>) => {
  return notes.map((note) => {
    return (
      <ViewTransition key={note.id} exit="fade-out" enter="fade-in">
        <NoteListItem note={note} />
      </ViewTransition>
    );
  });
};

/**
 * Each page after the first loads the notes older than the last note of the page before it, so a
 * note created or deleted in an earlier page moves the later pages' cursors and they reload
 * without gaps or duplicates.
 */
const NotesListPage = ({
  before,
  depth,
  requestedPages,
}: NotesListPageProps) => {
  const { data, load, state } = useFetcher<NotesPageData>({
    key: `notes-page-${before}`,
  });

  React.useEffect(() => {
    if (state === 'idle' && !data) {
      void load(`${href('/notes')}?${new URLSearchParams({ before })}`);
    }
  }, [before, data, load, state]);

  if (!data) {
    return <NotesListLoader />;
  }

  return (
    <>
      <NotesListItems notes={data.notes} />
      <NotesListTail
        depth={depth}
        isEmpty={false}
        nextCursor={data.nextCursor}
        requestedPages={requestedPages}
      />
    </>
  );
};

const NotesListTail = ({
  depth,
  isEmpty,
  nextCursor,
  requestedPages,
}: NotesListTailProps) => {
  if (nextCursor && depth < requestedPages) {
    return (
      <NotesListPage
        key={nextCursor}
        depth={depth + 1}
        before={nextCursor}
        requestedPages={requestedPages}
      />
    );
  }

  if (nextCursor) {
    return <div aria-hidden="true" data-notes-load-more={depth} />;
  }

  if (isEmpty) {
    return <p className="text-muted py-2 text-center">No notes yet</p>;
  }

  return (
    <p className="text-muted py-4 text-center text-sm">
      You&apos;ve reached the end of your notes
    </p>
  );
};

const NotesList = ({ nextCursor, notes }: NotesPageData) => {
  const [requestedPages, setRequestedPages] = React.useState(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrolledToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    const loadMoreMarker = target.querySelector<HTMLElement>(
      '[data-notes-load-more]'
    );

    if (scrolledToBottom && loadMoreMarker) {
      setRequestedPages(Number(loadMoreMarker.dataset.notesLoadMore) + 1);
    }
  };

  return (
    <ScrollShadow
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto px-4 pt-2 pb-4 min-[373px]:px-8 lg:px-16"
    >
      <div className="flex flex-col gap-4">
        <NotesListItems notes={notes} />
        <NotesListTail
          depth={0}
          nextCursor={nextCursor}
          isEmpty={notes.length === 0}
          requestedPages={requestedPages}
        />
      </div>
    </ScrollShadow>
  );
};

export default NotesList;
