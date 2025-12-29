import type { CalendarDate } from '@internationalized/date';
import { today, getLocalTimeZone } from '@internationalized/date';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { NotePeriodKind } from '@models';

type UiState = {
  noteDrawer: {
    isOpen: boolean;
    periodDate: CalendarDate;
    periodKind: NonNullable<NotePeriodKind>;
  };
  noteDrawerActions: {
    closeNoteDrawer: () => void;
    openNoteDrawer: (
      periodDate: CalendarDate,
      periodKind: NonNullable<NotePeriodKind>
    ) => void;
    setPeriodDate: (date: CalendarDate) => void;
    setPeriodKind: (kind: NonNullable<NotePeriodKind>) => void;
  };
};

const useUiStore = create<UiState>()(
  immer((set) => {
    return {
      noteDrawer: {
        isOpen: false,
        periodDate: today(getLocalTimeZone()),
        periodKind: 'day',
      },
      noteDrawerActions: {
        closeNoteDrawer: () => {
          set((state) => {
            state.noteDrawer.isOpen = false;
            state.noteDrawer.periodDate = today(getLocalTimeZone());
            state.noteDrawer.periodKind = 'day';
          });
        },
        openNoteDrawer: (
          periodDate: CalendarDate,
          periodKind: NonNullable<NotePeriodKind>
        ) => {
          set((state) => {
            state.noteDrawer.isOpen = true;
            state.noteDrawer.periodDate = periodDate;
            state.noteDrawer.periodKind = periodKind;
          });
        },
        setPeriodDate: (date: CalendarDate) => {
          set((state) => {
            state.noteDrawer.periodDate = date;
          });
        },
        setPeriodKind: (kind: NonNullable<NotePeriodKind>) => {
          set((state) => {
            state.noteDrawer.periodKind = kind;
          });
        },
      },
    };
  })
);

export const useNoteDrawerState = () => {
  return useUiStore((state) => {
    return state.noteDrawer;
  });
};

export const useNoteDrawerActions = () => {
  return useUiStore((state) => {
    return state.noteDrawerActions;
  });
};
