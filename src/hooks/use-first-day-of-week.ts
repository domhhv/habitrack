import { getLocalTimeZone } from '@internationalized/date';
import { useLocale } from 'react-aria';
import { useCalendarState } from 'react-stately';

import { DAYS_OF_WEEK } from '@const';
import { createCalendar } from '@utils';

import useProfile from './use-profile';

const useFirstDayOfWeek = () => {
  const profile = useProfile();
  const { locale } = useLocale();
  const calendarState = useCalendarState({
    createCalendar,
    locale,
  });

  if (profile) {
    return profile.firstDayOfWeek;
  }

  const [firstDate] = calendarState.getDatesInWeek(0);
  const dayIndex = firstDate?.toDate(getLocalTimeZone()).getDay() ?? 1;

  return DAYS_OF_WEEK[dayIndex] ?? DAYS_OF_WEEK[1];
};

export default useFirstDayOfWeek;
