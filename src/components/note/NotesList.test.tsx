import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { useLoaderData, createRoutesStub } from 'react-router';
import { it, vi, expect, describe } from 'vitest';

import type { NoteWithHabit } from '@models';

import NotesList from './NotesList';

vi.stubGlobal(
  'ResizeObserver',
  class {
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();
  }
);

const makeNote = (id: string): NoteWithHabit => {
  return {
    content: `Content ${id}`,
    createdAt: '2026-07-10T10:00:00.000Z',
    id,
    periodDate: '2026-07-10',
    periodKind: 'day',
    updatedAt: null,
    userId: 'user-id',
  };
};

type NotesPage = {
  nextCursor: string | null;
  notes: NoteWithHabit[];
};

const renderNotesList = (loader: (before: string | null) => NotesPage) => {
  const Stub = createRoutesStub([
    {
      path: '/notes',
      Component: () => {
        return <NotesList {...useLoaderData<NotesPage>()} />;
      },
      loader: ({ request }) => {
        return loader(new URL(request.url).searchParams.get('before'));
      },
    },
  ]);

  return render(<Stub initialEntries={['/notes']} />);
};

const scrollToBottom = (container: HTMLElement) => {
  const scrollContainer = container.querySelector('.overflow-y-auto')!;

  Object.defineProperties(scrollContainer, {
    clientHeight: { configurable: true, value: 100 },
    scrollHeight: { configurable: true, value: 100 },
    scrollTop: { configurable: true, value: 0 },
  });
  fireEvent.scroll(scrollContainer);
};

describe('NotesList', () => {
  it('shows an empty state without notes', async () => {
    renderNotesList(() => {
      return { nextCursor: null, notes: [] };
    });

    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
  });

  it('loads the notes after the last cursor when scrolled to the bottom', async () => {
    const loader = vi.fn((before: string | null) => {
      return before
        ? { nextCursor: null, notes: [makeNote('page-1')] }
        : { nextCursor: 'cursor-1', notes: [makeNote('page-0')] };
    });
    const { container } = renderNotesList(loader);

    expect(await screen.findByText('Content page-0')).toBeInTheDocument();
    expect(
      screen.queryByText("You've reached the end of your notes")
    ).not.toBeInTheDocument();

    scrollToBottom(container);

    expect(await screen.findByText('Content page-1')).toBeInTheDocument();
    expect(screen.getByText('Content page-0')).toBeInTheDocument();
    expect(loader).toHaveBeenLastCalledWith('cursor-1');
    expect(loader).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(
        screen.getByText("You've reached the end of your notes")
      ).toBeInTheDocument();
    });

    scrollToBottom(container);

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
