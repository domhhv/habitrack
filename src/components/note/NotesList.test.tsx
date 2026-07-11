import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import type { NoteWithHabit } from '@models';
import { useBoundStore } from '@stores';

import NotesList from './NotesList';

const listAllNotes = vi.hoisted(() => {
  return vi.fn();
});
const rollbarError = vi.hoisted(() => {
  return vi.fn();
});

vi.mock('@services', () => {
  return { listAllNotes };
});
vi.mock('@rollbar/react', () => {
  return {
    useRollbar: () => {
      return { error: rollbarError };
    },
  };
});

vi.stubGlobal(
  'ResizeObserver',
  class {
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();
  }
);

const makeNote = (id: string, createdAt: string): NoteWithHabit => {
  return {
    content: `Content ${id}`,
    createdAt,
    id,
    periodDate: '2026-07-10',
    periodKind: 'day',
    updatedAt: null,
    userId: 'user-id',
  };
};

describe('NotesList', () => {
  beforeEach(() => {
    listAllNotes.mockReset();
    rollbarError.mockReset();
    useBoundStore.getState().noteActions.clearNotes();
  });

  it('renders calendar notes from the store before the first page resolves', async () => {
    let resolvePage: ((notes: NoteWithHabit[]) => void) | undefined;
    listAllNotes.mockReturnValue(
      new Promise((resolve) => {
        resolvePage = resolve;
      })
    );
    const cachedNote = makeNote('cached', '2026-07-10T10:00:00.000Z');

    useBoundStore.setState({ notes: { [cachedNote.id]: cachedNote } });
    render(<NotesList />);

    expect(screen.getByText('Content cached')).toBeInTheDocument();
    expect(listAllNotes).toHaveBeenCalledWith({ limit: 20, page: 0 });

    resolvePage?.([]);

    await waitFor(() => {
      expect(useBoundStore.getState().notesListIsLoading).toBe(false);
    });
  });

  it('populates the Zustand store when the page is opened directly', async () => {
    const fetchedNote = makeNote('fetched', '2026-07-10T10:00:00.000Z');
    listAllNotes.mockResolvedValue([fetchedNote]);

    render(<NotesList />);

    expect(await screen.findByText('Content fetched')).toBeInTheDocument();
    expect(useBoundStore.getState().notes[fetchedNote.id]).toEqual(fetchedNote);
  });

  it('fetches and caches subsequent pages while scrolling', async () => {
    const firstPage = Array.from({ length: 20 }, (_, index) => {
      return makeNote(
        `page-0-${index}`,
        `2026-07-10T10:${String(index).padStart(2, '0')}:00.000Z`
      );
    });
    const nextPageNote = makeNote('page-1-0', '2026-07-09T10:00:00.000Z');
    listAllNotes
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce([nextPageNote]);

    const { container } = render(<NotesList />);

    expect(await screen.findByText('Content page-0-0')).toBeInTheDocument();

    const scrollContainer = container.querySelector('.overflow-y-auto');

    expect(scrollContainer).not.toBeNull();
    Object.defineProperties(scrollContainer!, {
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 100 },
      scrollTop: { configurable: true, value: 0 },
    });
    fireEvent.scroll(scrollContainer!);

    expect(await screen.findByText('Content page-1-0')).toBeInTheDocument();
    expect(listAllNotes).toHaveBeenLastCalledWith({ limit: 20, page: 1 });
    expect(useBoundStore.getState().notes[nextPageNote.id]).toEqual(
      nextPageNote
    );
  });
});
