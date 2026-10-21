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

const renderNotesList = (
  loader: (pageCount: number) => {
    hasMore: boolean;
    notes: NoteWithHabit[];
    pageCount: number;
  }
) => {
  const Stub = createRoutesStub([
    {
      path: '/notes',
      Component: () => {
        return <NotesList {...useLoaderData()} />;
      },
      loader: ({ request }) => {
        return loader(
          Number(new URL(request.url).searchParams.get('pages') || 1)
        );
      },
    },
  ]);

  return render(<Stub initialEntries={['/notes']} />);
};

describe('NotesList', () => {
  it('shows an empty state without notes', async () => {
    renderNotesList(() => {
      return { hasMore: false, notes: [], pageCount: 1 };
    });

    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
  });

  it('loads one more page into the URL when scrolled to the bottom', async () => {
    const loader = vi.fn((pageCount: number) => {
      return {
        hasMore: pageCount === 1,
        pageCount,
        notes: Array.from({ length: pageCount }, (_, index) => {
          return makeNote(`page-${index}`);
        }),
      };
    });
    const { container } = renderNotesList(loader);

    expect(await screen.findByText('Content page-0')).toBeInTheDocument();

    const scrollContainer = container.querySelector('.overflow-y-auto');

    Object.defineProperties(scrollContainer!, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 100 },
      scrollTop: { configurable: true, value: 0 },
    });
    fireEvent.scroll(scrollContainer!);

    expect(await screen.findByText('Content page-1')).toBeInTheDocument();
    expect(loader).toHaveBeenLastCalledWith(2);

    await waitFor(() => {
      expect(
        screen.getByText("You've reached the end of your notes")
      ).toBeInTheDocument();
    });
  });
});
