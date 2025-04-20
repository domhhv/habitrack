import type { Note, NotesInsert, NotesUpdate } from '@models';
import { createNote, destroyNote, listNotes, updateNote } from '@services';
import { create } from 'zustand';

type NotesState = {
  notes: Note[];
  actions: {
    fetchNotes: () => Promise<void>;
    addNote: (note: NotesInsert) => Promise<Note>;
    updateNote: (id: number, note: NotesUpdate) => Promise<Note>;
    deleteNote: (id: number) => Promise<void>;
    clearNotes: () => void;
  };
};

const useNotesStore = create<NotesState>((set) => {
  return {
    notes: [],

    actions: {
      clearNotes: () => {
        set({ notes: [] });
      },

      fetchNotes: async () => {
        const notes = await listNotes();
        set({ notes });
      },

      addNote: async (note: NotesInsert) => {
        const newNote = await createNote(note);

        set((state) => {
          return { notes: [...state.notes, newNote] };
        });

        return newNote;
      },

      updateNote: async (id: number, note: NotesUpdate) => {
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

      deleteNote: async (id: number) => {
        await destroyNote(id);
        set((state) => {
          return {
            notes: state.notes.filter((note) => {
              return note.id !== id;
            }),
          };
        });
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
