import { ScrollShadow } from '@heroui/react';
import { useRollbar } from '@rollbar/react';
import React from 'react';

import { NoteListItem, InfinityLoader } from '@components';
import { useNotesList, useNoteActions, useNotesListState } from '@stores';
import { getErrorMessage } from '@utils';

const NotesList = () => {
  const notes = useNotesList();
  const { fetchNextNotesPage, initializeNotesList } = useNoteActions();
  const { hasMore, isLoading } = useNotesListState();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const rollbar = useRollbar();

  React.useEffect(() => {
    void initializeNotesList().catch((error: unknown) => {
      rollbar.error('Failed to initialize notes list', getErrorMessage(error));
      console.error('Failed to fetch notes:', error);
    });
  }, [initializeNotesList, rollbar]);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (scrolledToBottom && hasMore && !isLoading) {
        void fetchNextNotesPage().catch((error: unknown) => {
          rollbar.error('Failed to fetch notes', getErrorMessage(error));
          console.error('Failed to fetch notes:', error);
        });
      }
    },
    [fetchNextNotesPage, hasMore, isLoading, rollbar]
  );

  const renderEndMessage = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <InfinityLoader color="var(--accent)" />
        </div>
      );
    }

    if (!hasMore && notes.length > 0) {
      return (
        <p className="text-muted py-4 text-center text-sm">
          You&apos;ve reached the end of your notes
        </p>
      );
    }

    if (!isLoading && notes.length === 0) {
      return <p className="text-muted py-2 text-center">No notes yet</p>;
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
