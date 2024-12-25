import { generateCalendarRange } from '@helpers';
import { useDocumentTitle } from '@hooks';
import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import { useOccurrencesStore } from '@stores';
import { capitalizeFirstLetter } from '@utils';
import React from 'react';
import { type AriaButtonProps, useCalendar, useLocale } from 'react-aria';
import { useCalendarState } from 'react-stately';

import AddOccurrenceDialog from './AddOccurrenceDialog';
import CalendarGrid from './CalendarGrid';
import CalendarHeader from './CalendarHeader';

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
  const [dayModalDialogOpen, setDayModalDialogOpen] = React.useState(false);
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

  const handleDayModalDialogOpen = (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => {
    setDayModalDialogOpen(true);
    setActiveDate(new Date(fullYear, monthIndex - 1, dateNumber, 12));
  };

  const handleDayModalDialogClose = () => {
    setActiveDate(null);
    setDayModalDialogOpen(false);
  };

  return (
    <>
      <div
        {...calendarProps}
        className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 pb-8 lg:gap-4 lg:px-16 lg:py-4"
      >
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
          state={state}
          onDayModalDialogOpen={handleDayModalDialogOpen}
        />
      </div>

      <AddOccurrenceDialog
        open={dayModalDialogOpen}
        onClose={handleDayModalDialogClose}
        date={activeDate}
      />
    </>
  );
};

export default Calendar;
