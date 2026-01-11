import { GregorianCalendar } from '@internationalized/date';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendar } from 'react-aria';
import { useCalendarState } from 'react-stately';

import { MonthCalendar } from '@components';
import { useUser } from '@hooks';

const createCalendar = (identifier: string) => {
  switch (identifier) {
    case 'gregory':
      return new GregorianCalendar();

    default:
      throw new Error(`Unsupported calendar ${identifier}`);
  }
};

const firstDaysOfWeek = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
] as const;

const MonthCalendarPage = () => {
  const { locale } = useLocale();
  const { user } = useUser();
  const firstDayOfWeek =
    firstDaysOfWeek[user?.userMetadata.firstDayOfWeek ?? 0];
  const calendarState = useCalendarState({
    createCalendar,
    firstDayOfWeek,
    locale,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 md:gap-3 md:py-3 lg:px-16"
    >
      <title>{`${capitalize(title)} | Habitrack Calendar`}</title>
      <MonthCalendar state={calendarState} firstDayOfWeek={firstDayOfWeek} />
    </div>
  );
};

export default MonthCalendarPage;
