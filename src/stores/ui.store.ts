import type { CalendarDate } from '@internationalized/date';
import { today, getLocalTimeZone } from '@internationalized/date';
import type { RequireAtLeastOne } from 'type-fest';

import type { Habit, Occurrence, NotePeriodKind } from '@models';

import { useBoundStore, type SliceCreator } from './bound.store';

type OccurrenceDrawerOptions = {
  dayToDisplay?: CalendarDate;
  dayToLog?: CalendarDate;
  habitIdToDisplay?: Habit['id'];
  occurrenceToEdit?: Occurrence;
};

export type UiSlice = {
  calendarRange: [number, number];
  changeCalendarRange: (range: [number, number]) => void;
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
  } & RequireAtLeastOne<
    OccurrenceDrawerOptions,
    'dayToLog' | 'dayToDisplay' | 'occurrenceToEdit'
  >;
  occurrenceDrawerActions: {
    closeOccurrenceDrawer: () => void;
    openOccurrenceDrawer: (
      opts: RequireAtLeastOne<
        OccurrenceDrawerOptions,
        'dayToLog' | 'dayToDisplay' | 'occurrenceToEdit'
      >
    ) => void;
  };
};

export const createUiSlice: SliceCreator<keyof UiSlice> = (set) => {
  return {
    calendarRange: [0, 0],
    changeCalendarRange: (range: [number, number]) => {
      set((state) => {
        state.calendarRange = range;
      });
    },
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
      dayToLog: today(getLocalTimeZone()),
      isOpen: false,
    },
    occurrenceDrawerActions: {
      closeOccurrenceDrawer: () => {
        set((state) => {
          state.occurrenceDrawer.isOpen = false;
          setTimeout(() => {
            set((state) => {
              state.occurrenceDrawer.dayToLog = today(getLocalTimeZone());
            });
          }, 50);
        });
      },
      openOccurrenceDrawer: (opts) => {
        set((state) => {
          state.occurrenceDrawer.isOpen = true;
          state.occurrenceDrawer.dayToDisplay = undefined;
          state.occurrenceDrawer.dayToLog = undefined;
          state.occurrenceDrawer.occurrenceToEdit = undefined;
          state.occurrenceDrawer.habitIdToDisplay = undefined;
          Object.assign(state.occurrenceDrawer, opts);
        });
      },
    },
  };
};

export const useCalendarRange = () => {
  return useBoundStore((state) => {
    return state.calendarRange;
  });
};

export const useCalendarRangeChange = () => {
  return useBoundStore((state) => {
    return state.changeCalendarRange;
  });
};

export const useOccurrenceDrawerState = () => {
  return useBoundStore((state) => {
    return state.occurrenceDrawer;
  });
};

export const useOccurrenceDrawerActions = () => {
  return useBoundStore((state) => {
    return state.occurrenceDrawerActions;
  });
};

export const useNoteDrawerState = () => {
  return useBoundStore((state) => {
    return state.noteDrawer;
  });
};

export const useNoteDrawerActions = () => {
  return useBoundStore((state) => {
    return state.noteDrawerActions;
  });
};
