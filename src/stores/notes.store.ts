import { create } from 'zustand';

import type { Note, NotesInsert, NotesUpdate } from '@models';
import { listNotes, createNote, updateNote, destroyNote } from '@services';

type NotesState = {
  notes: Note[];
  actions: {
    addNote: (note: NotesInsert) => Promise<Note>;
    clearNotes: () => void;
    deleteNote: (id: Note['id']) => Promise<void>;
    fetchNotes: () => Promise<void>;
    updateNote: (id: Note['id'], note: NotesUpdate) => Promise<Note>;
  };
};

const useNotesStore = create<NotesState>((set) => {
  return {
    notes: [],

    actions: {
      addNote: async (note: NotesInsert) => {
        const newNote = await createNote(note);

        set((state) => {
          return { notes: [...state.notes, newNote] };
        });

        return newNote;
      },

      clearNotes: () => {
        set({ notes: [] });
      },

      deleteNote: async (id: Note['id']) => {
        await destroyNote(id);
        set((state) => {
          return {
            notes: state.notes.filter((note) => {
              return note.id !== id;
            }),
          };
        });
      },

      fetchNotes: async () => {
        const notes = await listNotes();
        set({ notes });
      },

      updateNote: async (id: Note['id'], note: NotesUpdate) => {
        const updatedNote = await updateNote(id, note);

        set((state) => {
          return {
            notes: state.notes.map((n) => {
              return n.id === updatedNote.id ? updatedNote : n;
            }),
          };
        });

        return updatedNote;
      },
    },
  };
});

export const useNotes = () => {
  return useNotesStore((state) => {
    return state.notes;
  });
};

export const useNoteActions = () => {
  return useNotesStore((state) => {
    return state.actions;
  });
};
