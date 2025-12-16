import { Spinner, ScrollShadow } from '@heroui/react';
import React from 'react';

import { NoteListItem } from '@components';
import type { NoteWithHabit } from '@models';
import { listAllNotes } from '@services';

const PAGE_SIZE = 20;

const NotesList = () => {
  const [notes, setNotes] = React.useState<NoteWithHabit[]>([]);
  const [page, setPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const fetchNotes = React.useCallback(
    async (pageToFetch: number) => {
      if (isLoading) {
        return;
      }

      setIsLoading(true);

      try {
        const fetchedNotes = await listAllNotes({
          limit: PAGE_SIZE,
          page: pageToFetch,
        });

        if (fetchedNotes.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setNotes((prev) => {
          return pageToFetch === 0 ? fetchedNotes : [...prev, ...fetchedNotes];
        });
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  React.useEffect(() => {
    void fetchNotes(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (scrolledToBottom && hasMore && !isLoading) {
        const nextPage = page + 1;
        setPage(nextPage);
        void fetchNotes(nextPage);
      }
    },
    [hasMore, isLoading, page, fetchNotes]
  );

  const renderEndMessage = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <Spinner size="sm" color="primary" />
        </div>
      );
    }

    if (!hasMore && notes.length > 0) {
      return (
        <p className="text-default-500 py-4 text-center text-sm">
          You&apos;ve reached the end of your notes
        </p>
      );
    }

    if (!isLoading && notes.length === 0) {
      return (
        <p className="text-default-500 py-8 text-center">
          No notes yet. Create notes from the calendar view!
        </p>
      );
    }

    return null;
  };

  return (
    <ScrollShadow
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto px-4 pt-2 pb-4 min-[373px]:px-8 lg:px-16"
    >
      <div className="flex flex-col gap-4">
        {notes.map((note) => {
          return <NoteListItem note={note} key={note.id} />;
        })}
        {renderEndMessage()}
      </div>
    </ScrollShadow>
  );
};

export default NotesList;
