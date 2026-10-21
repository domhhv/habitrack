import { render, screen, fireEvent } from '@testing-library/react';
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

  it('loads the first page when the page is opened', async () => {
    const fetchedNote = makeNote('fetched', '2026-07-10T10:00:00.000Z');
    listAllNotes.mockResolvedValue([fetchedNote]);

    render(<NotesList />);

    expect(await screen.findByText('Content fetched')).toBeInTheDocument();
    expect(useBoundStore.getState().notesList).toEqual([fetchedNote]);
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
    expect(useBoundStore.getState().notesList).toContainEqual(nextPageNote);
  });
});
