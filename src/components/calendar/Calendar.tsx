import { generateCalendarRange } from '@helpers';
import { useDocumentTitle } from '@hooks';
import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import { useDisclosure } from '@nextui-org/react';
import { useOccurrencesStore } from '@stores';
import { capitalizeFirstLetter } from '@utils';
import clsx from 'clsx';
import React from 'react';
import { type AriaButtonProps, useCalendar, useLocale } from 'react-aria';
import { useCalendarState } from 'react-stately';

import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';
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

const Calendar = () => {
  const { onRangeChange } = useOccurrencesStore();
  const { locale } = useLocale();
  const state = useCalendarState({
    locale,
    createCalendar,
  });
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useCalendar({}, state);
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

  React.useEffect(() => {
    onRangeChange(
      generateCalendarRange(
        state.visibleRange.start.year,
        state.visibleRange.start.month
      )
    );
  }, [
    state.visibleRange.start.year,
    state.visibleRange.start.month,
    onRangeChange,
  ]);

  const [activeMonthLabel, activeYear] = title.split(' ');

  useDocumentTitle(
    `${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`
  );

  const transformButtonProps = (
    buttonProps: Pick<AriaButtonProps<'button'>, 'isDisabled' | 'aria-label'>
  ) => ({
    'aria-label': buttonProps['aria-label'] || '',
    disabled: Boolean(buttonProps.isDisabled),
  });

  const setFocusedDate = (year: number, month: number, day: number) => {
    const nextFocusedDate = new CalendarDate(year, month, day);
    state.setFocusedDate(nextFocusedDate);
  };

  const navigateToMonth = (month: number) => {
    const { year, day } = state.focusedDate;
    setFocusedDate(year, month, day);
  };

  const navigateToYear = (year: number) => {
    const { month, day } = state.focusedDate;
    setFocusedDate(year, month, day);
  };

  const resetFocusedDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth();
    const year = now.getFullYear();
    setFocusedDate(year, month + 1, day);
  };

  const calendarContainerClassName = clsx(
    'flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-2 pb-8 lg:gap-4 lg:px-0 lg:px-16 lg:py-4',
    isOccurrenceDialogOpen && 'pointer-events-none'
  );

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

  return (
    <>
      <div {...calendarProps} className={calendarContainerClassName}>
        <CalendarHeader
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={activeYear}
          prevButtonProps={transformButtonProps(prevButtonProps)}
          nextButtonProps={transformButtonProps(nextButtonProps)}
          onNavigateBack={state.focusPreviousPage}
          onNavigateForward={state.focusNextPage}
          onNavigateToMonth={navigateToMonth}
          onNavigateToYear={navigateToYear}
          onResetFocusedDate={resetFocusedDate}
        />
        <CalendarGrid
          activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
          activeYear={Number(activeYear)}
          state={state}
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

export default Calendar;
