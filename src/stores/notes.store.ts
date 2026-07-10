import type { CalendarDateTime } from '@internationalized/date';
import { toZoned, getLocalTimeZone } from '@internationalized/date';
import keyBy from 'lodash.keyby';
import { useShallow } from 'zustand/react/shallow';

import type { Note, Occurrence, NotesInsert, NotesUpdate } from '@models';
import { listNotes, createNote, updateNote, destroyNote } from '@services';
import {
  isNoteOfPeriod,
  type CalendarRange,
  isNoteOfOccurrence,
  createCalendarRangeCache,
  getSiblingPrefetchRanges,
} from '@utils';

import { useBoundStore, type SliceCreator } from './bound.store';

export type NotesSlice = {
  notes: Record<Note['id'], Note>;
  notesByOccurrenceId: Record<Occurrence['id'], Note>;
  notesFetchedRange: [CalendarDateTime, CalendarDateTime] | null;
  noteActions: {
    addNote: (note: NotesInsert) => Promise<Note>;
    clearNotes: () => void;
    deleteNote: (id: Note['id']) => Promise<void>;
    fetchNotes: () => Promise<void>;
    updateNote: (id: Note['id'], note: NotesUpdate) => Promise<Note>;
  };
};

export const createNotesSlice: SliceCreator<keyof NotesSlice> = (
  set,
  getState
) => {
  const cache = createCalendarRangeCache<Note[]>();
  let cacheVersion = 0;

  const clearCache = () => {
    cache.clear();
    cacheVersion += 1;
  };

  const loadRange = (range: CalendarRange) => {
    return cache.load(range, () => {
      return listNotes([
        toZoned(range[0], getLocalTimeZone()),
        toZoned(range[1], getLocalTimeZone()),
      ]);
    });
  };

  const prefetchSiblingRanges = (range: CalendarRange) => {
    getSiblingPrefetchRanges(range).forEach((siblingRange) => {
      void loadRange(siblingRange).catch(() => {
        return undefined;
      });
    });
  };

  return {
    notes: {},
    notesByOccurrenceId: {},
    notesFetchedRange: null,

    noteActions: {
      addNote: async (note: NotesInsert) => {
        const newNote = await createNote(note);

        clearCache();

        set(
          (state) => {
            state.notesFetchedRange = null;
            state.notes[newNote.id] = newNote;

            if ('occurrenceId' in newNote && newNote.occurrenceId) {
              state.notesByOccurrenceId[newNote.occurrenceId] = newNote;
            }
          },
          undefined,
          'noteActions.addNote'
        );

        return newNote;
      },

      clearNotes: () => {
        clearCache();

        set(
          (state) => {
            state.notes = {};
            state.notesByOccurrenceId = {};
            state.notesFetchedRange = null;
          },
          undefined,
          'noteActions.clearNotes'
        );
      },

      deleteNote: async (id: Note['id']) => {
        await destroyNote(id);

        clearCache();

        set(
          (state) => {
            state.notesFetchedRange = null;
            const noteToDelete = state.notes[id];
            delete state.notes[id];

            if ('occurrenceId' in noteToDelete && noteToDelete?.occurrenceId) {
              delete state.notesByOccurrenceId[noteToDelete.occurrenceId];
            }
          },
          undefined,
          'noteActions.deleteNote'
        );
      },

      fetchNotes: async () => {
        const {
          calendarRange: [rangeStart, rangeEnd],
          user,
        } = getState();

        if (!user || rangeStart.compare(rangeEnd) === 0) {
          return;
        }

        const range: CalendarRange = [rangeStart, rangeEnd];
        const cachedNotes = cache.get(range);
        const currentRequest = cachedNotes ? null : loadRange(range);

        prefetchSiblingRanges(range);

        const requestVersion = cacheVersion;
        const notes = cachedNotes ?? (await currentRequest!);
        const currentState = getState();

        if (
          requestVersion !== cacheVersion ||
          currentState.user?.id !== user.id ||
          currentState.calendarRange[0].compare(rangeStart) !== 0 ||
          currentState.calendarRange[1].compare(rangeEnd) !== 0
        ) {
          return;
        }

        set(
          (state) => {
            state.notes = keyBy(notes, 'id');
            state.notesByOccurrenceId = keyBy(
              notes.filter(isNoteOfOccurrence),
              'occurrenceId'
            );
            state.notesFetchedRange = [rangeStart, rangeEnd];
          },
          undefined,
          cachedNotes
            ? 'noteActions.fetchNotes.cacheHit'
            : 'noteActions.fetchNotes.cacheMiss'
        );
      },

      updateNote: async (id: Note['id'], note: NotesUpdate) => {
        const updatedNote = await updateNote(id, note);

        clearCache();

        set(
          (state) => {
            state.notesFetchedRange = null;
            state.notes[id] = updatedNote;

            if ('occurrenceId' in updatedNote && updatedNote.occurrenceId) {
              state.notesByOccurrenceId[updatedNote.occurrenceId] = updatedNote;
            }
          },
          undefined,
          'noteActions.updateNote'
        );

        return updatedNote;
      },
    },
  };
};

export const useNotes = () => {
  return useBoundStore(
    useShallow((state) => {
      return Object.values(state.notes);
    })
  );
};

export const useNotesByOccurrenceId = () => {
  return useBoundStore((state) => {
    return state.notesByOccurrenceId;
  });
};

export const usePeriodNotes = () => {
  return useNotes().filter(isNoteOfPeriod);
};

export const useWeekNotes = () => {
  return usePeriodNotes().filter((note) => {
    return note.periodKind === 'week';
  });
};

export const useDayNotes = () => {
  return usePeriodNotes().filter((note) => {
    return note.periodKind === 'day';
  });
};

export const useMonthNotes = () => {
  return usePeriodNotes().filter((note) => {
    return note.periodKind === 'month';
  });
};

export const useNoteActions = () => {
  return useBoundStore((state) => {
    return state.noteActions;
  });
};
