import { getLocalTimeZone } from '@internationalized/date';
import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendar } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import { MonthCalendar } from '@components';
import { useFirstDayOfWeek } from '@hooks';
import { createCalendar, getFocusedCalendarDate } from '@utils';

const MonthCalendarPage = () => {
  const firstDayOfWeek = useFirstDayOfWeek();
  const { locale } = useLocale();
  const params = useParams();
  const focusedDate = getFocusedCalendarDate(
    'month',
    params,
    locale,
    firstDayOfWeek,
    getLocalTimeZone()
  );
  const calendarState = useCalendarState({
    createCalendar,
    firstDayOfWeek,
    focusedValue: focusedDate,
    locale,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-3 pb-8 sm:px-8 md:gap-3 md:py-4 lg:pr-8 lg:pl-16"
    >
      <title>{`${capitalize(title)} | Habitrack Calendar`}</title>
      <MonthCalendar state={calendarState} />
    </div>
  );
};

export default MonthCalendarPage;
