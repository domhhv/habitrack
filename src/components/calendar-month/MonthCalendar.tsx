import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import { useOccurrencesStore } from '@stores';
import { capitalizeFirstLetter } from '@utils';
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  startOfToday,
} from 'date-fns';
import React from 'react';
import { useCalendar, useLocale } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';
import { useShallow } from 'zustand/react/shallow';

import MonthCalendarGrid from './MonthCalendarGrid';
import MonthCalendarHeader from './MonthCalendarHeader';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();

    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const MonthCalendar = () => {
  const onRangeChange = useOccurrencesStore(
    useShallow((state) => {
      return state.onRangeChange;
    })
  );
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    locale,
    createCalendar,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);
  const params = useParams();

  React.useEffect(() => {
    const currentMonth = startOfMonth(startOfToday());

    const {
      year = currentMonth.getFullYear(),
      month = currentMonth.getMonth() + 1,
      day = currentMonth.getDate(),
    } = params;

    const focusedDate = new Date(Number(year), Number(month) - 1, Number(day));

    const rangeStart = startOfWeek(startOfMonth(focusedDate));
    const rangeEnd = endOfWeek(endOfMonth(focusedDate));

    onRangeChange([+rangeStart, +rangeEnd]);

    const nextFocusedDate = new CalendarDate(
      focusedDate.getFullYear(),
      focusedDate.getMonth() + 1,
      focusedDate.getDate()
    );

    const hasFocusedDateChanged =
      calendarState.focusedDate.toString() !== nextFocusedDate.toString();

    if (hasFocusedDateChanged) {
      calendarState.setFocusedDate(nextFocusedDate);
    }
  }, [params, calendarState, onRangeChange]);

  const [activeMonthLabel, activeYear] = title.split(' ');

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 lg:gap-4 lg:px-16 lg:py-4"
    >
      <title>
        {`${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`}
      </title>
      <MonthCalendarHeader
        activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
        activeYear={activeYear}
      />
      <MonthCalendarGrid
        activeMonthLabel={capitalizeFirstLetter(activeMonthLabel)}
        activeYear={Number(activeYear)}
        state={calendarState}
      />
    </div>
  );
};

export default MonthCalendar;
