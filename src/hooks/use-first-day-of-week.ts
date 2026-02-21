import { getLocalTimeZone } from '@internationalized/date';
import { useLocale } from 'react-aria';
import { useCalendarState } from 'react-stately';

import { DAYS_OF_WEEK } from '@const';
import { useProfile } from '@stores';
import { createCalendar } from '@utils';

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

  return DAYS_OF_WEEK[dayIndex];
};

export default useFirstDayOfWeek;
