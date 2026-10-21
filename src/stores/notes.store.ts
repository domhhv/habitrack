import { useShallow } from 'zustand/react/shallow';

import type { Note, NoteWithHabit } from '@models';
import { listAllNotes } from '@services';

import { useBoundStore, type SliceCreator } from './bound.store';

export type NotesSlice = {
  notesList: NoteWithHabit[];
  notesListHasMore: boolean;
  notesListIsInitialized: boolean;
  notesListIsLoading: boolean;
  notesListNextPage: number;
  noteActions: {
    clearNotes: () => void;
    fetchNextNotesPage: () => Promise<void>;
    initializeNotesList: () => Promise<void>;
    refreshNotesList: () => void;
  };
};

const NOTES_PAGE_SIZE = 20;

const initialNotesListState = {
  notesList: [],
  notesListHasMore: true,
  notesListIsInitialized: false,
  notesListIsLoading: false,
  notesListNextPage: 0,
};

const mergeNotes = (...noteGroups: NoteWithHabit[][]) => {
  const notesById = new Map<Note['id'], NoteWithHabit>();

  noteGroups.flat().forEach((note) => {
    notesById.set(note.id, note);
  });

  return [...notesById.values()].sort((first, second) => {
    return (
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  });
};

export const createNotesSlice: SliceCreator<keyof NotesSlice> = (
  set,
  getState
) => {
  const notesListPageCache = new Map<number, NoteWithHabit[]>();
  let notesListCacheVersion = 0;
  let notesListRequest: Promise<void> | null = null;

  const resetNotesList = (actionName: string) => {
    notesListPageCache.clear();
    notesListCacheVersion += 1;
    notesListRequest = null;

    set(
      (state) => {
        Object.assign(state, initialNotesListState);
      },
      undefined,
      actionName
    );
  };

  const fetchNotesListPage = (page: number) => {
    const cachedPage = notesListPageCache.get(page);

    if (cachedPage) {
      set(
        (state) => {
          state.notesList = mergeNotes(state.notesList, cachedPage);
          state.notesListHasMore = cachedPage.length === NOTES_PAGE_SIZE;
          state.notesListNextPage = Math.max(state.notesListNextPage, page + 1);
        },
        undefined,
        'noteActions.fetchNotesListPage.cacheHit'
      );

      return Promise.resolve();
    }

    if (notesListRequest) {
      return notesListRequest;
    }

    const requestVersion = notesListCacheVersion;

    set(
      (state) => {
        state.notesListIsLoading = true;
      },
      undefined,
      'noteActions.fetchNotesListPage.start'
    );

    notesListRequest = listAllNotes({ limit: NOTES_PAGE_SIZE, page })
      .then((fetchedNotes) => {
        if (requestVersion !== notesListCacheVersion) {
          return;
        }

        notesListPageCache.set(page, fetchedNotes);

        set(
          (state) => {
            state.notesList = mergeNotes(state.notesList, fetchedNotes);
            state.notesListHasMore = fetchedNotes.length === NOTES_PAGE_SIZE;
            state.notesListNextPage = page + 1;
          },
          undefined,
          'noteActions.fetchNotesListPage.success'
        );
      })
      .finally(() => {
        if (requestVersion === notesListCacheVersion) {
          set(
            (state) => {
              state.notesListIsLoading = false;
            },
            undefined,
            'noteActions.fetchNotesListPage.finish'
          );
          notesListRequest = null;
        }
      });

    return notesListRequest;
  };

  const initializeNotesList = async () => {
    if (getState().notesListIsInitialized) {
      return;
    }

    set(
      (state) => {
        state.notesListIsInitialized = true;
      },
      undefined,
      'noteActions.initializeNotesList'
    );

    try {
      await fetchNotesListPage(0);
    } catch (error) {
      set(
        (state) => {
          state.notesListIsInitialized = false;
        },
        undefined,
        'noteActions.initializeNotesList.error'
      );

      throw error;
    }
  };

  return {
    ...initialNotesListState,

    noteActions: {
      initializeNotesList,

      clearNotes: () => {
        resetNotesList('noteActions.clearNotes');
      },

      fetchNextNotesPage: async () => {
        const { notesListHasMore, notesListIsLoading, notesListNextPage } =
          getState();

        if (!notesListHasMore || notesListIsLoading) {
          return;
        }

        await fetchNotesListPage(notesListNextPage);
      },

      refreshNotesList: () => {
        const { notesListIsInitialized } = getState();

        resetNotesList('noteActions.refreshNotesList');

        if (notesListIsInitialized) {
          void initializeNotesList().catch(() => {
            return undefined;
          });
        }
      },
    },
  };
};

export const useNotesList = () => {
  return useBoundStore((state) => {
    return state.notesList;
  });
};

export const useNotesListState = () => {
  return useBoundStore(
    useShallow((state) => {
      return {
        hasMore: state.notesListHasMore,
        isLoading: state.notesListIsLoading,
      };
    })
  );
};

export const useNoteActions = () => {
  return useBoundStore((state) => {
    return state.noteActions;
  });
};

/* Bridge: remove when the notes page loads its list in a route loader. */
export const refreshStoreNotesList = () => {
  useBoundStore.getState().noteActions.refreshNotesList();
};
