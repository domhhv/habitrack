import type { ButtonProps } from '@heroui/react';
import type { CalendarDate, CalendarDateTime } from '@internationalized/date';
import {
  now,
  today,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';
import type { ReactNode } from 'react';
import type { RequireAtLeastOne } from 'type-fest';

import type { Habit, Occurrence, NotePeriodKind } from '@models';

import { useBoundStore, type SliceCreator } from './bound.store';

type OccurrenceDrawerOptions = {
  dayToDisplay?: CalendarDate;
  dayToLog?: CalendarDate;
  habitIdToDisplay?: Habit['id'];
  occurrenceToEdit?: Occurrence;
};

export type ConfirmationOptions = {
  cancelText?: string;
  color?: ButtonProps['color'];
  confirmText?: string;
  description?: ReactNode;
  title?: string;
};

export type CalendarFilters = {
  habitIds: string[];
  isShownOnMobile: boolean;
  traitIds: string[];
};

type ConfirmationState = ConfirmationOptions & {
  isOpen: boolean;
};

export type UiSlice = {
  calendarFilters: CalendarFilters;
  calendarRange: [CalendarDateTime, CalendarDateTime];
  confirmation: ConfirmationState;
  changeCalendarFilters: (filters: CalendarFilters) => void;
  changeCalendarRange: (range: [CalendarDateTime, CalendarDateTime]) => void;
  confirmationActions: {
    approveConfirmation: () => void;
    askConfirmation: (options?: ConfirmationOptions) => Promise<boolean>;
    rejectConfirmation: () => void;
  };
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

let resolveConfirm: ((value: boolean) => void) | null = null;

const initialConfirmationState = {
  cancelText: undefined,
  color: undefined,
  confirmText: undefined,
  description: undefined,
  isOpen: false,
  title: undefined,
};

export const createUiSlice: SliceCreator<keyof UiSlice> = (set) => {
  return {
    confirmation: initialConfirmationState,
    changeCalendarFilters: (filters) => {
      set((state) => {
        state.calendarFilters = filters;
      });
    },
    changeCalendarRange: (range) => {
      set((state) => {
        state.calendarRange = range;
      });
    },
    calendarFilters: {
      habitIds: [],
      isShownOnMobile: false,
      traitIds: [],
    },
    calendarRange: [
      toCalendarDateTime(now(getLocalTimeZone())),
      toCalendarDateTime(now(getLocalTimeZone())),
    ],
    confirmationActions: {
      approveConfirmation: () => {
        if (resolveConfirm) {
          resolveConfirm(true);
          resolveConfirm = null;
        }

        set((state) => {
          state.confirmation = initialConfirmationState;
        });
      },
      askConfirmation: (
        options: ConfirmationOptions = {}
      ): Promise<boolean> => {
        return new Promise((resolve) => {
          resolveConfirm = resolve;

          set((state) => {
            state.confirmation = {
              cancelText: options.cancelText,
              color: options.color,
              confirmText: options.confirmText,
              description: options.description,
              isOpen: true,
              title: options.title,
            };
          });
        });
      },
      rejectConfirmation: () => {
        if (resolveConfirm) {
          resolveConfirm(false);
          resolveConfirm = null;
        }

        set((state) => {
          state.confirmation = initialConfirmationState;
        });
      },
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

export const useCalendarFilters = () => {
  return useBoundStore((state) => {
    return state.calendarFilters;
  });
};

export const useCalendarFiltersChange = () => {
  return useBoundStore((state) => {
    return state.changeCalendarFilters;
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

export const useConfirmationState = () => {
  return useBoundStore((state) => {
    return state.confirmation;
  });
};

export const useConfirmationActions = () => {
  return useBoundStore((state) => {
    return state.confirmationActions;
  });
};
