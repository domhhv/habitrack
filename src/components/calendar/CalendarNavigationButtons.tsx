import {
  today,
  isToday,
  endOfWeek,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  getLocalTimeZone,
} from '@internationalized/date';
import {
  CalendarDotIcon,
  ArrowFatLeftIcon,
  ArrowFatRightIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { useLocale } from 'react-aria';
import { useNavigate, useLocation } from 'react-router';
import type { CalendarState } from 'react-stately';

import { CustomButton } from '@components';
import { useScreenWidth, useFirstDayOfWeek, useKeyboardShortcut } from '@hooks';
import { useNoteDrawerState, useOccurrenceDrawerState } from '@stores';
import { isCalendarView, getCalendarHref } from '@utils';

type CalendarNavigationButtonsProps = {
  focusedDate: CalendarState['focusedDate'];
};

const CalendarNavigationButtons = ({
  focusedDate,
}: CalendarNavigationButtonsProps) => {
  const timeZone = getLocalTimeZone();
  const location = useLocation();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const occurrenceDrawerState = useOccurrenceDrawerState();
  const noteDrawerState = useNoteDrawerState();
  const firstDayOfWeek = useFirstDayOfWeek();
  const { isDesktop } = useScreenWidth();

  const calendarMode = React.useMemo(() => {
    const view = location.pathname.split('/').filter(Boolean)[1];

    return isCalendarView(view) ? view : 'month';
  }, [location.pathname]);

  const [previousRangePath, nextRangePath] = React.useMemo(() => {
    const toSet = {
      days: calendarMode === 'day' ? 1 : 0,
      months: calendarMode === 'month' ? 1 : 0,
      weeks: calendarMode === 'week' ? 1 : 0,
    };

    return [
      getCalendarHref(calendarMode, focusedDate.subtract(toSet)),
      getCalendarHref(calendarMode, focusedDate.add(toSet)),
    ];
  }, [focusedDate, calendarMode]);

  useKeyboardShortcut(
    'ArrowLeft',
    () => {
      navigate(previousRangePath);
    },
    { enabled: !occurrenceDrawerState.isOpen && !noteDrawerState.isOpen }
  );

  useKeyboardShortcut(
    'ArrowRight',
    () => {
      navigate(nextRangePath);
    },
    { enabled: !occurrenceDrawerState.isOpen && !noteDrawerState.isOpen }
  );

  const isSameRange = React.useMemo(() => {
    const todayDate = today(timeZone);

    if (calendarMode === 'day') {
      return isToday(focusedDate, timeZone);
    }

    if (calendarMode === 'month') {
      return isSameMonth(focusedDate, today(timeZone));
    }

    const weekStart = startOfWeek(focusedDate, locale, firstDayOfWeek);
    const weekEnd = endOfWeek(focusedDate, locale, firstDayOfWeek);

    return todayDate.compare(weekStart) >= 0 && todayDate.compare(weekEnd) <= 0;
  }, [calendarMode, focusedDate, firstDayOfWeek, timeZone, locale]);

  const todayRangePath = React.useMemo(() => {
    const todayDate = today(timeZone);

    if (calendarMode === 'day') {
      return getCalendarHref('day', todayDate);
    }

    if (calendarMode === 'month') {
      return getCalendarHref('month', startOfMonth(todayDate));
    }

    const weekStart = startOfWeek(todayDate, locale, firstDayOfWeek).add({
      days: firstDayOfWeek === 'sun' ? 4 : 3,
    });

    return getCalendarHref('week', weekStart);
  }, [calendarMode, timeZone, locale, firstDayOfWeek]);

  return (
    <>
      <CustomButton
        variant="tertiary"
        href={previousRangePath}
        size={isDesktop ? 'md' : 'sm'}
        aria-label={`Previous ${calendarMode}`}
        className="px-3 max-md:size-7 max-md:min-w-7 max-md:px-0"
      >
        <ArrowFatLeftIcon size={20} className="max-md:size-4" />
      </CustomButton>
      <CustomButton
        href={todayRangePath}
        size={isDesktop ? 'md' : 'sm'}
        aria-label={`Current ${calendarMode}`}
        variant={isSameRange ? 'secondary' : 'tertiary'}
        className="px-3 max-md:size-7 max-md:min-w-7 max-md:px-0"
      >
        <CalendarDotIcon size={20} className="max-md:size-4" />
      </CustomButton>
      <CustomButton
        variant="tertiary"
        href={nextRangePath}
        size={isDesktop ? 'md' : 'sm'}
        aria-label={`Next ${calendarMode}`}
        className="px-3 max-md:size-7 max-md:min-w-7 max-md:px-0"
      >
        <ArrowFatRightIcon size={20} className="max-md:size-4" />
      </CustomButton>
    </>
  );
};

export default CalendarNavigationButtons;
