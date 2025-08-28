import keyBy from 'lodash.keyby';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

import type { Note, NotesInsert, NotesUpdate } from '@models';
import { listNotes, createNote, updateNote, destroyNote } from '@services';
import { isNoteOfPeriod } from '@utils';

type NotesState = {
  notes: Record<Note['id'], Note>;
  actions: {
    addNote: (note: NotesInsert) => Promise<Note>;
    clearNotes: () => void;
    deleteNote: (id: Note['id']) => Promise<void>;
    fetchNotes: () => Promise<void>;
    updateNote: (id: Note['id'], note: NotesUpdate) => Promise<Note>;
  };
};

const useNotesStore = create<NotesState>()(
  immer((set) => {
    return {
      notes: {},

      actions: {
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
          const notes = await listNotes();

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
  })
);

export const useNotes = () => {
  return useNotesStore(
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
  return useNotesStore((state) => {
    return state.actions;
  });
};
