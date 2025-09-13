import { GregorianCalendar } from '@internationalized/date';
import React from 'react';
import { useCalendar } from 'react-aria';
import { useCalendarState } from 'react-stately';

import { MonthCalendar } from '@components';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();

    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

type MonthCalendarPageProps = {
  locale: string;
};

const MonthCalendarPage = ({ locale }: MonthCalendarPageProps) => {
  const calendarState = useCalendarState({
    createCalendar,
    locale,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);

  const [activeMonthLabel, activeYear] = title.split(' ');

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 md:gap-4 md:py-4 lg:px-16"
    >
      <title>
        {`${activeMonthLabel.slice(0, 3)} ${activeYear} | Habitrack Calendar`}
      </title>
      <MonthCalendar
        state={calendarState}
        activeYear={activeYear}
        activeMonthLabel={activeMonthLabel}
      />
    </div>
  );
};

export default MonthCalendarPage;
