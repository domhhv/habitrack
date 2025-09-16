import { GregorianCalendar } from '@internationalized/date';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendar } from 'react-aria';
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

const MonthCalendarPage = () => {
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    createCalendar,
    locale,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 md:gap-4 md:py-4 lg:px-16"
    >
      <title>{`${capitalize(title)} | Habitrack Calendar`}</title>
      <MonthCalendar state={calendarState} />
    </div>
  );
};

export default MonthCalendarPage;
