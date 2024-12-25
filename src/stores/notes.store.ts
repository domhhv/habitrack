import type { Note, NotesInsert } from '@models';
import { useSnackbarsStore } from '@stores';
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

import { createNote, listNotes } from '../services/notes.service';

type NotesState = {
  notes: Note[];
  fetchingNotes: boolean;
  addingNote: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (note: NotesInsert) => Promise<void>;
  clearNotes: () => void;
};

const { showSnackbar } = useSnackbarsStore.getState();

const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  fetchingNotes: false,
  addingNote: false,
  fetchNotes: async () => {
    try {
      set({ fetchingNotes: true });
      const notes = await listNotes();
      set({ notes });
    } catch (error) {
      console.error(error);
      showSnackbar('Something went wrong while fetching your notes.', {
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
        dismissible: true,
      });
    } finally {
      set({ fetchingNotes: false });
    }
  },
  addNote: async (note: NotesInsert) => {
    try {
      set({ addingNote: true });
      const newNote = await createNote(note);
      set((state) => ({ notes: [...state.notes, newNote] }));
      showSnackbar('Note added successfully', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      console.error(error);
      showSnackbar('Something went wrong while adding your trait', {
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
        dismissible: true,
      });
    } finally {
      set({ addingNote: false });
    }
  },
  clearNotes: () => {
    set({ notes: [] });
  },
}));

export default useNotesStore;
