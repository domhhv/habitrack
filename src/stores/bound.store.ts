import {
  create,
  type StateCreator,
  type StoreMutatorIdentifier,
} from 'zustand';
import { devtools } from 'zustand/middleware';
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
);
