import type { CalendarDateTime } from '@internationalized/date';
import { toZoned, getLocalTimeZone } from '@internationalized/date';
import keyBy from 'lodash.keyby';
import { useShallow } from 'zustand/react/shallow';

import type { Note, Occurrence, NotesInsert, NotesUpdate } from '@models';
import { listNotes, createNote, updateNote, destroyNote } from '@services';
import { isNoteOfPeriod, isNoteOfOccurrence } from '@utils';

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
  /* eslint-disable @typescript-eslint/no-dynamic-delete */
  return {
    notes: {},
    notesByOccurrenceId: {},
    notesFetchedRange: null,

    noteActions: {
      addNote: async (note: NotesInsert) => {
        const newNote = await createNote(note);

        set((state) => {
          state.notesFetchedRange = null;
          state.notes[newNote.id] = newNote;

          if ('occurrenceId' in newNote && newNote.occurrenceId) {
            state.notesByOccurrenceId[newNote.occurrenceId] = newNote;
          }
        });

        return newNote;
      },

      clearNotes: () => {
        set((state) => {
          state.notes = {};
          state.notesFetchedRange = null;
        });
      },

      deleteNote: async (id: Note['id']) => {
        await destroyNote(id);

        set((state) => {
          state.notesFetchedRange = null;
          const noteToDelete = state.notes[id];
          delete state.notes[id];

          if ('occurrenceId' in noteToDelete && noteToDelete?.occurrenceId) {
            delete state.notesByOccurrenceId[noteToDelete.occurrenceId];
          }
        });
      },

      fetchNotes: async () => {
        const {
          calendarRange: [rangeStart, rangeEnd],
          notesFetchedRange,
          user,
        } = getState();

        if (!user || rangeStart.compare(rangeEnd) === 0) {
          return;
        }

        const isCached =
          notesFetchedRange &&
          notesFetchedRange[0].compare(rangeStart) <= 0 &&
          notesFetchedRange[1].compare(rangeEnd) >= 0;

        if (isCached) {
          return;
        }

        const notes = await listNotes([
          toZoned(rangeStart, getLocalTimeZone()),
          toZoned(rangeEnd, getLocalTimeZone()),
        ]);

        set((state) => {
          state.notes = keyBy(notes, 'id');
          state.notesByOccurrenceId = keyBy(
            notes.filter(isNoteOfOccurrence),
            'occurrenceId'
          );
          state.notesFetchedRange = [rangeStart, rangeEnd];
        });
      },

      updateNote: async (id: Note['id'], note: NotesUpdate) => {
        const updatedNote = await updateNote(id, note);

        set((state) => {
          state.notesFetchedRange = null;
          state.notes[id] = updatedNote;

          if ('occurrenceId' in updatedNote && updatedNote.occurrenceId) {
            state.notesByOccurrenceId[updatedNote.occurrenceId] = updatedNote;
          }
        });

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
  return useBoundStore(
    useShallow((state) => {
      return state.notesByOccurrenceId;
    })
  );
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

export const useNoteActions = () => {
  return useBoundStore((state) => {
    return state.noteActions;
  });
};
