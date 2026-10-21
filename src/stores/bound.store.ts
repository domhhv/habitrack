import {
  create,
  type StateCreator,
  type StoreMutatorIdentifier,
} from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { type ThemeSlice, createThemeSlice } from './theme.store';
import { type UiSlice, createUiSlice } from './ui.store';

export type ImmerStateCreator<
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
> = StateCreator<
  T,
  [...Mps, ['zustand/devtools', never], ['zustand/immer', never]],
  Mcs
>;

export type BoundStore = UiSlice & ThemeSlice;

export type SliceCreator<TSlice extends keyof BoundStore> = (
  ...params: Parameters<ImmerStateCreator<BoundStore>>
) => Pick<ReturnType<ImmerStateCreator<BoundStore>>, TSlice>;

export const useBoundStore = create<BoundStore>()(
  devtools(
    immer((set, get, store) => {
      return {
        ...createUiSlice(set, get, store),
        ...createThemeSlice(set, get, store),
      };
    }),
    { enabled: process.env.NODE_ENV === 'development' }
  )
);
