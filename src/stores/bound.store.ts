import {
  create,
  type StateCreator,
  type StoreMutatorIdentifier,
} from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { type MetricsSlice, createMetricsSlice } from './metrics.store';
import { type NotesSlice, createNotesSlice } from './notes.store';
import {
  type OccurrencesSlice,
  createOccurrencesSlice,
} from './occurrences.store';
import { type ThemeSlice, createThemeSlice } from './theme.store';
import { type UiSlice, createUiSlice } from './ui.store';
import { type UserSlice, createUserSlice } from './user.store';

export type ImmerStateCreator<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
> = StateCreator<
  T,
  [...Mps, ['zustand/devtools', never], ['zustand/immer', never]],
  Mcs
>;

export type BoundStore = UserSlice &
  UiSlice &
  ThemeSlice &
  MetricsSlice &
  NotesSlice &
  OccurrencesSlice;

export type SliceCreator<TSlice extends keyof BoundStore> = (
  ...params: Parameters<ImmerStateCreator<BoundStore>>
) => Pick<ReturnType<ImmerStateCreator<BoundStore>>, TSlice>;

export const useBoundStore = create<BoundStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get, store) => {
        return {
          ...createUiSlice(set, get, store),
          ...createThemeSlice(set, get, store),
          ...createUserSlice(set, get, store),
          ...createNotesSlice(set, get, store),
          ...createMetricsSlice(set, get, store),
          ...createOccurrencesSlice(set, get, store),
        };
      })
    ),
    { enabled: true }
  )
);

useBoundStore.subscribe(
  ({ calendarRange: [calendarRangeStart, calendarRangeEnd], user }) => {
    return {
      calendarRangeEnd,
      calendarRangeStart,
      userId: user?.id,
    };
  },
  (newState, prevState) => {
    const { noteActions, occurrencesActions } = useBoundStore.getState();

    if (!newState.userId && prevState.userId) {
      occurrencesActions.clearOccurrences();
      noteActions.clearNotes();

      return;
    }

    if (newState.userId && newState.userId !== prevState.userId) {
      void occurrencesActions.fetchOccurrences();
      void noteActions.fetchNotes();

      return;
    }

    const hasRangeEndChanged = !!newState.calendarRangeEnd.compare(
      prevState.calendarRangeEnd
    );
    const hasRangeStartChanged = !!newState.calendarRangeStart.compare(
      prevState.calendarRangeStart
    );

    if (hasRangeEndChanged || hasRangeStartChanged) {
      void occurrencesActions.fetchOccurrences();
      void noteActions.fetchNotes();
    }
  }
);
