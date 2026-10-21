import { ScrollShadow } from '@heroui/react';
import React from 'react';
import { useNavigation, useSearchParams } from 'react-router';

import { NoteListItem, InfinityLoader } from '@components';
import type { NoteWithHabit } from '@models';

type NotesListProps = {
  hasMore: boolean;
  notes: NoteWithHabit[];
  pageCount: number;
};

const NotesList = ({ hasMore, notes, pageCount }: NotesListProps) => {
  const navigation = useNavigation();
  const [, setSearchParams] = useSearchParams();
  const isLoading =
    navigation.state === 'loading' && navigation.location.pathname === '/notes';

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrolledToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (scrolledToBottom && hasMore && !isLoading) {
      setSearchParams(
        { pages: String(pageCount + 1) },
        { preventScrollReset: true, replace: true }
      );
    }
  };

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
