import type { ButtonProps } from '@heroui/react';
import type { CalendarDate } from '@internationalized/date';
import { today, getLocalTimeZone } from '@internationalized/date';
import type { ReactNode } from 'react';
import type { RequireAtLeastOne } from 'type-fest';

import type { Habit, Occurrence, NotePeriodKind } from '@models';

import { useBoundStore, type SliceCreator } from './bound.store';

type OccurrenceDrawerOptions = {
  dayToDisplay?: CalendarDate;
  dayToLog?: CalendarDate;
  habitIdToDisplay?: Habit['id'];
  occurrenceIdToEdit?: Occurrence['id'];
};

export type ConfirmationOptions = {
  cancelText?: string;
  confirmText?: string;
  description?: ReactNode;
  title?: string;
  variant?: ButtonProps['variant'];
};

export type CalendarFilters = {
  hiddenHabitIds: string[];
  hiddenTraitIds: string[];
  isShownOnMobile: boolean;
};

type ConfirmationState = ConfirmationOptions & {
  isOpen: boolean;
};

export type UiSlice = {
  calendarFilters: CalendarFilters;
  confirmation: ConfirmationState;
  isMobileSidebarOpen: boolean;
  changeCalendarFilters: (filters: CalendarFilters) => void;
  confirmationActions: {
    approveConfirmation: () => void;
    askConfirmation: (options?: ConfirmationOptions) => Promise<boolean>;
    rejectConfirmation: () => void;
  };
  mobileSidebarActions: {
    closeMobileSidebar: () => void;
    openMobileSidebar: () => void;
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
    'dayToLog' | 'dayToDisplay' | 'occurrenceIdToEdit'
  >;
  occurrenceDrawerActions: {
    closeOccurrenceDrawer: () => void;
    openOccurrenceDrawer: (
      opts: RequireAtLeastOne<
        OccurrenceDrawerOptions,
        'dayToLog' | 'dayToDisplay' | 'occurrenceIdToEdit'
      >
    ) => void;
    setDayToDisplay: (date: CalendarDate) => void;
  };
};

let resolveConfirm: ((value: boolean) => void) | null = null;

const initialConfirmationState = {
  cancelText: undefined,
  confirmText: undefined,
  description: undefined,
  isOpen: false,
  title: undefined,
  variant: undefined,
};

export const createUiSlice: SliceCreator<keyof UiSlice> = (set) => {
  return {
    confirmation: initialConfirmationState,
    isMobileSidebarOpen: false,
    changeCalendarFilters: (filters) => {
      set(
        (state) => {
          state.calendarFilters = filters;
        },
        undefined,
        'uiActions.changeCalendarFilters'
      );
    },
    calendarFilters: {
      hiddenHabitIds: [],
      hiddenTraitIds: [],
      isShownOnMobile: false,
    },
    confirmationActions: {
      approveConfirmation: () => {
        if (resolveConfirm) {
          resolveConfirm(true);
          resolveConfirm = null;
        }

        set(
          (state) => {
            state.confirmation = initialConfirmationState;
          },
          undefined,
          'uiActions.approveConfirmation'
        );
      },
      askConfirmation: (
        options: ConfirmationOptions = {}
      ): Promise<boolean> => {
        return new Promise((resolve) => {
          resolveConfirm = resolve;

          set((state) => {
            state.confirmation = {
              cancelText: options.cancelText,
              confirmText: options.confirmText,
              description: options.description,
              isOpen: true,
              title: options.title,
              variant: options.variant,
            };
          });
        });
      },
      rejectConfirmation: () => {
        if (resolveConfirm) {
          resolveConfirm(false);
          resolveConfirm = null;
        }

        set(
          (state) => {
            state.confirmation = initialConfirmationState;
          },
          undefined,
          'uiActions.rejectConfirmation'
        );
      },
    },
    mobileSidebarActions: {
      closeMobileSidebar: () => {
        set(
          (state) => {
            state.isMobileSidebarOpen = false;
          },
          undefined,
          'uiActions.closeMobileSidebar'
        );
      },
      openMobileSidebar: () => {
        set(
          (state) => {
            state.isMobileSidebarOpen = true;
          },
          undefined,
          'uiActions.openMobileSidebar'
        );
      },
    },
    noteDrawer: {
      isOpen: false,
      periodDate: today(getLocalTimeZone()),
      periodKind: 'day',
    },
    noteDrawerActions: {
      closeNoteDrawer: () => {
        set(
          (state) => {
            state.noteDrawer.isOpen = false;
            state.noteDrawer.periodDate = today(getLocalTimeZone());
            state.noteDrawer.periodKind = 'day';
          },
          undefined,
          'uiActions.closeNoteDrawer'
        );
      },
      openNoteDrawer: (
        periodDate: CalendarDate,
        periodKind: NonNullable<NotePeriodKind>
      ) => {
        set(
          (state) => {
            state.noteDrawer.isOpen = true;
            state.noteDrawer.periodDate = periodDate;
            state.noteDrawer.periodKind = periodKind;
          },
          undefined,
          'uiActions.openNoteDrawer'
        );
      },
      setPeriodDate: (date: CalendarDate) => {
        set(
          (state) => {
            state.noteDrawer.periodDate = date;
          },
          undefined,
          'uiActions.setPeriodDate'
        );
      },
      setPeriodKind: (kind: NonNullable<NotePeriodKind>) => {
        set(
          (state) => {
            state.noteDrawer.periodKind = kind;
          },
          undefined,
          'uiActions.setPeriodKind'
        );
      },
    },
    occurrenceDrawer: {
      dayToLog: today(getLocalTimeZone()),
      isOpen: false,
    },
    occurrenceDrawerActions: {
      closeOccurrenceDrawer: () => {
        set(
          (state) => {
            state.occurrenceDrawer.isOpen = false;
            setTimeout(() => {
              set(
                (state) => {
                  state.occurrenceDrawer.dayToLog = today(getLocalTimeZone());
                },
                undefined,
                'uiActions.closeOccurrenceDrawer.setDayToLog'
              );
            }, 50);
          },
          undefined,
          'uiActions.closeOccurrenceDrawer'
        );
      },
      openOccurrenceDrawer: (opts) => {
        set(
          (state) => {
            state.occurrenceDrawer.isOpen = true;
            state.occurrenceDrawer.dayToDisplay = undefined;
            state.occurrenceDrawer.dayToLog = undefined;
            state.occurrenceDrawer.occurrenceIdToEdit = undefined;
            state.occurrenceDrawer.habitIdToDisplay = undefined;
            Object.assign(state.occurrenceDrawer, opts);
          },
          undefined,
          'uiActions.openOccurrenceDrawer'
        );
      },
      setDayToDisplay: (date) => {
        set(
          (state) => {
            state.occurrenceDrawer.dayToDisplay = date;
          },
          undefined,
          'uiActions.setDayToDisplay'
        );
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

export const useMobileSidebarState = () => {
  return useBoundStore((state) => {
    return state.isMobileSidebarOpen;
  });
};

export const useMobileSidebarActions = () => {
  return useBoundStore((state) => {
    return state.mobileSidebarActions;
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
