import { generateCalendarRange } from '@helpers';
import { useDocumentTitle } from '@hooks';
import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import { useDisclosure } from '@nextui-org/react';
import { useOccurrencesStore } from '@stores';
import { capitalizeFirstLetter } from '@utils';
import clsx from 'clsx';
import React from 'react';
import { type AriaButtonProps, useCalendar, useLocale } from 'react-aria';
import { useLocation } from 'react-router-dom';
import { useCalendarState } from 'react-stately';

import MonthCalendarGrid from './MonthCalendarGrid';
import MonthCalendarHeader from './MonthCalendarHeader';
import NoteDialog from './NoteDialog';
import OccurrenceDialog from './OccurrenceDialog';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();
    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const MonthCalendar = () => {
  const { onRangeChange } = useOccurrencesStore();
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    locale,
    createCalendar,
  });
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar({}, calendarState);
  const {
    isOpen: isNoteDialogOpen,
    onOpen: openNoteDialog,
    onClose: closeNoteDialog,
  } = useDisclosure();
  const {
    isOpen: isOccurrenceDialogOpen,
    onOpen: openOccurrenceDialog,
    onClose: closeOccurrenceDialog,
  } = useDisclosure();
  const [activeDate, setActiveDate] = React.useState<Date | null>(null);
  const { state: locationState } = useLocation();

  const setFocusedDate = React.useCallback(
    (year: number, month: number, day: number) => {
      const nextFocusedDate = new CalendarDate(year, month, day);
      calendarState.setFocusedDate(nextFocusedDate);
    },
    [calendarState]
  );

  React.useEffect(() => {
    if (!locationState) {
      return;
    }

    const { year, month } = locationState;

    setFocusedDate(year, month, 1);
  }, [locationState, setFocusedDate]);

  React.useEffect(() => {
    onRangeChange(
      generateCalendarRange(
        calendarState.visibleRange.start.year,
        calendarState.visibleRange.start.month
      )
    );
  }, [
    calendarState.visibleRange.start.year,
    calendarState.visibleRange.start.month,
    onRangeChange,
  ]);

  const [activeMonthLabel, activeYear] = title.split(' ');

  useDocumentTitle(
    `${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`
  );

  const navigateToMonth = (month: number) => {
    const { year, day } = calendarState.focusedDate;
    setFocusedDate(year, month, day);
  };

  const navigateToYear = (year: number) => {
    const { month, day } = calendarState.focusedDate;
    setFocusedDate(year, month, day);
  };

  const resetFocusedDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    setFocusedDate(year, month + 1, day);
  };

  const handleOccurrenceModalClose = () => {
    window.setTimeout(() => {
      closeOccurrenceDialog();
      setActiveDate(null);
    }, 0);
  };

  const handleOccurrenceModalOpen = (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => {
    openOccurrenceDialog();
    setActiveDate(new Date(fullYear, monthIndex - 1, dateNumber, 12));
  };

  const handleNoteModalClose = () => {
    window.setTimeout(() => {
      closeNoteDialog();
      setActiveDate(null);
    }, 0);
  };

  const handleNoteModalOpen = (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => {
    openNoteDialog();
    setActiveDate(new Date(fullYear, monthIndex - 1, dateNumber, 12));
  };

  const transformButtonProps = (
    buttonProps: Pick<AriaButtonProps<'button'>, 'isDisabled' | 'aria-label'>
  ) => ({
    'aria-label': buttonProps['aria-label'] || '',
    disabled: Boolean(buttonProps.isDisabled),
  });

  const calendarContainerClassName = clsx(
    'flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 lg:gap-4 lg:px-16 lg:py-4',
    isOccurrenceDialogOpen && 'pointer-events-none'
  );

  return (
    <>
      <div {...calendarProps} className={calendarContainerClassName}>
        <MonthCalendarHeader
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={activeYear}
          prevButtonProps={transformButtonProps(prevButtonProps)}
          nextButtonProps={transformButtonProps(nextButtonProps)}
          onNavigateBack={calendarState.focusPreviousPage}
          onNavigateForward={calendarState.focusNextPage}
          onNavigateToMonth={navigateToMonth}
          onNavigateToYear={navigateToYear}
          onResetFocusedDate={resetFocusedDate}
        />
        <MonthCalendarGrid
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={Number(activeYear)}
          state={calendarState}
          onAddOccurrence={handleOccurrenceModalOpen}
          onAddNote={handleNoteModalOpen}
        />
      </div>

      <OccurrenceDialog
        isOpen={isOccurrenceDialogOpen}
        onClose={handleOccurrenceModalClose}
        date={activeDate}
      />

      <NoteDialog
        open={isNoteDialogOpen}
        onClose={handleNoteModalClose}
        date={activeDate}
      />
    </>
  );
};

export default MonthCalendar;
