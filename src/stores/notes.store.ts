import type { CalendarDateTime } from '@internationalized/date';
import { toZoned, getLocalTimeZone } from '@internationalized/date';
import keyBy from 'lodash.keyby';
import { useShallow } from 'zustand/react/shallow';

import type {
  Note,
  Occurrence,
  NotesInsert,
  NotesUpdate,
  NoteWithHabit,
} from '@models';
import {
  listNotes,
  createNote,
  updateNote,
  destroyNote,
  listAllNotes,
} from '@services';
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
  notesList: NoteWithHabit[];
  notesListHasMore: boolean;
  notesListIsInitialized: boolean;
  notesListIsLoading: boolean;
  notesListNextPage: number;
  noteActions: {
    addNote: (note: NotesInsert) => Promise<Note>;
    clearNotes: () => void;
    deleteNote: (id: Note['id']) => Promise<void>;
    fetchNextNotesPage: () => Promise<void>;
    fetchNotes: () => Promise<void>;
    initializeNotesList: () => Promise<void>;
    updateNote: (id: Note['id'], note: NotesUpdate) => Promise<Note>;
  };
};

const NOTES_PAGE_SIZE = 20;

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
  const cache = createCalendarRangeCache<Note[]>();
  const notesListPageCache = new Map<number, NoteWithHabit[]>();
  let cacheVersion = 0;
  let notesListCacheVersion = 0;
  let notesListRequest: Promise<void> | null = null;

  const clearCache = () => {
    cache.clear();
    cacheVersion += 1;
  };

  const clearNotesListCache = () => {
    notesListPageCache.clear();
    notesListCacheVersion += 1;
    notesListRequest = null;
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
            fetchedNotes.forEach((note) => {
              state.notes[note.id] = note;

              if ('occurrenceId' in note && note.occurrenceId) {
                state.notesByOccurrenceId[note.occurrenceId] = note;
              }
            });
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

  return {
    notes: {},
    notesByOccurrenceId: {},
    notesFetchedRange: null,
    notesList: [],
    notesListHasMore: true,
    notesListIsInitialized: false,
    notesListIsLoading: false,
    notesListNextPage: 0,

    noteActions: {
      addNote: async (note: NotesInsert) => {
        const newNote = await createNote(note);

        clearCache();
        clearNotesListCache();

        set(
          (state) => {
            state.notesFetchedRange = null;
            state.notes[newNote.id] = newNote;
            state.notesList = mergeNotes(state.notesList, [newNote]);
            state.notesListHasMore = true;
            state.notesListIsInitialized = false;
            state.notesListIsLoading = false;
            state.notesListNextPage = 0;

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
        clearNotesListCache();

        set(
          (state) => {
            state.notes = {};
            state.notesByOccurrenceId = {};
            state.notesFetchedRange = null;
            state.notesList = [];
            state.notesListHasMore = true;
            state.notesListIsInitialized = false;
            state.notesListIsLoading = false;
            state.notesListNextPage = 0;
          },
          undefined,
          'noteActions.clearNotes'
        );
      },

      deleteNote: async (id: Note['id']) => {
        await destroyNote(id);

        clearCache();
        clearNotesListCache();

        set(
          (state) => {
            state.notesFetchedRange = null;
            const noteToDelete = state.notes[id];
            delete state.notes[id];
            state.notesList = state.notesList.filter((note) => {
              return note.id !== id;
            });
            state.notesListHasMore = true;
            state.notesListIsInitialized = false;
            state.notesListIsLoading = false;
            state.notesListNextPage = 0;

            if ('occurrenceId' in noteToDelete && noteToDelete?.occurrenceId) {
              delete state.notesByOccurrenceId[noteToDelete.occurrenceId];
            }
          },
          undefined,
          'noteActions.deleteNote'
        );
      },

      fetchNextNotesPage: async () => {
        const { notesListHasMore, notesListIsLoading, notesListNextPage } =
          getState();

        if (!notesListHasMore || notesListIsLoading) {
          return;
        }

        await fetchNotesListPage(notesListNextPage);
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
            state.notesList = mergeNotes(state.notesList, notes);
          },
          undefined,
          cachedNotes
            ? 'noteActions.fetchNotes.cacheHit'
            : 'noteActions.fetchNotes.cacheMiss'
        );
      },

      initializeNotesList: async () => {
        const { notes, notesListIsInitialized } = getState();

        if (notesListIsInitialized) {
          return;
        }

        const cachedRangeNotes = cache.values().flat();

        set(
          (state) => {
            state.notesList = mergeNotes(
              cachedRangeNotes,
              Object.values(notes),
              state.notesList
            );
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
      },

      updateNote: async (id: Note['id'], note: NotesUpdate) => {
        const updatedNote = await updateNote(id, note);

        clearCache();
        clearNotesListCache();

        set(
          (state) => {
            state.notesFetchedRange = null;
            state.notes[id] = updatedNote;
            state.notesList = mergeNotes(
              state.notesList.filter((note) => {
                return note.id !== id;
              }),
              [updatedNote]
            );
            state.notesListHasMore = true;
            state.notesListIsInitialized = false;
            state.notesListIsLoading = false;
            state.notesListNextPage = 0;

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
