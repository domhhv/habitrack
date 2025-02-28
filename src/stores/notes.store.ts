import { addToast } from '@heroui/react';
import type { Note, NotesInsert, NotesUpdate } from '@models';
import { createNote, destroyNote, listNotes, updateNote } from '@services';
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

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

const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  fetchingNotes: true,
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
      addToast({
        title:
          'Something went wrong while fetching your notes. Please try reloading the page.',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
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
      addToast({
        title: 'Note added successfully',
        color: 'success',
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while adding your note',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
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
      addToast({
        title: 'Note updated successfully',
        color: 'success',
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while updating your note',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
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
      addToast({
        title: 'Note deleted successfully',
        color: 'success',
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: 'Something went wrong while deleted your note',
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
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
