import { toCalendarDate } from '@internationalized/date';
import keyBy from 'lodash.keyby';
import { useShallow } from 'zustand/react/shallow';

import type { Note, NotesInsert, NotesUpdate } from '@models';
import {
  createNote,
  updateNote,
  destroyNote,
  listPeriodNotes,
} from '@services';
import { isNoteOfPeriod } from '@utils';

import { useBoundStore, type SliceCreator } from './bound.store';

export type NotesSlice = {
  notes: Record<Note['id'], Note>;
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
  return {
    notes: {},

    noteActions: {
      addNote: async (note: NotesInsert) => {
        const newNote = await createNote(note);

        set((state) => {
          state.notes[newNote.id] = newNote;
        });

        return newNote;
      },

      clearNotes: () => {
        set((state) => {
          state.notes = {};
        });
      },

      deleteNote: async (id: Note['id']) => {
        await destroyNote(id);

        set((state) => {
          delete state.notes[id];
        });
      },

      fetchNotes: async () => {
        const {
          calendarRange: [rangeStart, rangeEnd],
          user,
        } = getState();

        if (!user || rangeStart.compare(rangeEnd) === 0) {
          return;
        }

        const notes = await listPeriodNotes([
          toCalendarDate(rangeStart),
          toCalendarDate(rangeEnd),
        ]);

        set((state) => {
          state.notes = keyBy(notes, 'id');
        });
      },

      updateNote: async (id: Note['id'], note: NotesUpdate) => {
        const updatedNote = await updateNote(id, note);

        set((state) => {
          state.notes[id] = updatedNote;
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
