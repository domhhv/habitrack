import capitalize from 'lodash.capitalize';
import React from 'react';
import { useLocale, useCalendar } from 'react-aria';
import { useCalendarState } from 'react-stately';

import { MonthCalendar } from '@components';
import { useProfile } from '@stores';
import { createCalendar } from '@utils';

const MonthCalendarPage = () => {
  const { locale } = useLocale();
  const profile = useProfile();
  const calendarState = useCalendarState({
    createCalendar,
    firstDayOfWeek: profile?.firstDayOfWeek,
    locale,
  });
  const { calendarProps, title } = useCalendar({}, calendarState);

  return (
    <div
      {...calendarProps}
      className="flex h-full w-full max-w-full flex-1 flex-col gap-2 p-0 px-8 pb-8 md:gap-3 md:py-3 lg:px-16"
    >
      <title>{`${capitalize(title)} | Habitrack Calendar`}</title>
      <MonthCalendar state={calendarState} />
    </div>
  );
};

export default MonthCalendarPage;
