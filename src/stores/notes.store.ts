import type { Note, NotesInsert, NotesUpdate } from '@models';
import { useSnackbarsStore } from '@stores';
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

import {
  createNote,
  destroyNote,
  listNotes,
  updateNote,
} from '../services/notes.service';

type NotesState = {
  notes: Note[];
  fetchingNotes: boolean;
  addingNote: boolean;
  fetchNotes: () => Promise<void>;
  addNote: (note: NotesInsert) => Promise<void>;
  updateNote: (id: number, note: NotesUpdate) => Promise<void>;
  updatingNote: boolean;
  deleteNote: (id: number) => Promise<void>;
  deletingNote: boolean;
  clearNotes: () => void;
};

const { showSnackbar } = useSnackbarsStore.getState();

const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  fetchingNotes: false,
  addingNote: false,
  updatingNote: false,
  deletingNote: false,
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
  updateNote: async (id: number, note: NotesUpdate) => {
    try {
      set({ updatingNote: true });
      const updatedNote = await updateNote(id, note);
      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === updatedNote.id ? updatedNote : n
        ),
      }));
      showSnackbar('Note updated successfully', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      console.error(error);
      showSnackbar('Something went wrong while updating your note', {
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
        dismissible: true,
      });
    } finally {
      set({ updatingNote: false });
    }
  },
  deleteNote: async (id: number) => {
    try {
      set({ deletingNote: true });
      await destroyNote(id);
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }));
      showSnackbar('Note deleted successfully', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      console.error(error);
      showSnackbar('Something went wrong while deleting your note', {
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
        dismissible: true,
      });
    } finally {
      set({ deletingNote: false });
    }
  },
  clearNotes: () => {
    set({ notes: [] });
  },
}));

export default useNotesStore;
