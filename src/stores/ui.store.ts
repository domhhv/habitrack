import type { CalendarDate } from '@internationalized/date';
import { today, getLocalTimeZone } from '@internationalized/date';
import type { RequireAtLeastOne } from 'type-fest';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Habit, NotePeriodKind } from '@models';

type OccurrenceDrawerOptions = {
  dayToDisplay: CalendarDate | null;
  dayToLog: CalendarDate | null;
  habitIdToDisplay: Habit['id'] | null;
};

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
  occurrenceDrawer: {
    isOpen: boolean;
  } & RequireAtLeastOne<OccurrenceDrawerOptions>;
  occurrenceDrawerActions: {
    closeOccurrenceDrawer: () => void;
    openOccurrenceDrawer: (
      opts: RequireAtLeastOne<OccurrenceDrawerOptions>
    ) => void;
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
      occurrenceDrawer: {
        dayToDisplay: null,
        dayToLog: null,
        habitIdToDisplay: null,
        isOpen: false,
      },
      occurrenceDrawerActions: {
        closeOccurrenceDrawer: () => {
          set((state) => {
            state.occurrenceDrawer.isOpen = false;
            state.occurrenceDrawer.dayToDisplay = null;
            state.occurrenceDrawer.habitIdToDisplay = null;
            state.occurrenceDrawer.dayToLog = null;
          });
        },
        openOccurrenceDrawer: (opts) => {
          set((state) => {
            state.occurrenceDrawer.isOpen = true;
            Object.assign(state.occurrenceDrawer, opts);
          });
        },
      },
    };
  })
);

export const useOccurrenceDrawerState = () => {
  return useUiStore((state) => {
    return state.occurrenceDrawer;
  });
};

export const useOccurrenceDrawerActions = () => {
  return useUiStore((state) => {
    return state.occurrenceDrawerActions;
  });
};

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
