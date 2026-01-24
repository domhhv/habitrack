import {
  create,
  type StateCreator,
  type StoreMutatorIdentifier,
} from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { type HabitsSlice, createHabitsSlice } from './habits.store';
import { type NotesSlice, createNotesSlice } from './notes.store';
import {
  type OccurrencesSlice,
  createOccurrencesSlice,
} from './occurrences.store';
import { type TraitsSlice, createTraitsSlice } from './traits.store';
import { type UiSlice, createUiSlice } from './ui.store';
import { type UserSlice, createUserSlice } from './user.store';

export type ImmerStateCreator<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
> = StateCreator<T, [...Mps, ['zustand/immer', never]], Mcs>;

export type BoundStore = UserSlice &
  UiSlice &
  NotesSlice &
  TraitsSlice &
  HabitsSlice &
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
          ...createUserSlice(set, get, store),
          ...createNotesSlice(set, get, store),
          ...createTraitsSlice(set, get, store),
          ...createHabitsSlice(set, get, store),
          ...createOccurrencesSlice(set, get, store),
        };
      })
    )
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
    const { habitActions, noteActions, occurrencesActions, traitActions } =
      useBoundStore.getState();

    if (newState.userId && newState.userId !== prevState.userId) {
      void habitActions.fetchHabits();
      void traitActions.fetchTraits();
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
