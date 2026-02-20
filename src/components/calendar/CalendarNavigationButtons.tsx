import { cn, Button } from '@heroui/react';
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
  ArrowFatLeftIcon,
  ArrowFatRightIcon,
  ArrowsClockwiseIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { useLocale } from 'react-aria';
import { Link, useNavigate, useLocation } from 'react-router';
import type { CalendarState } from 'react-stately';

import { useScreenWidth, useKeyboardShortcut } from '@hooks';
import {
  useProfile,
  useNoteDrawerState,
  useOccurrenceDrawerState,
} from '@stores';

type CalendarNavigationButtonsProps = {
  focusedDate: CalendarState['focusedDate'];
};

const CalendarNavigationButtons = ({
  focusedDate,
}: CalendarNavigationButtonsProps) => {
  const timeZone = getLocalTimeZone();
  const location = useLocation();
  const { locale } = useLocale();
  const { isMobile, screenWidth } = useScreenWidth();
  const navigate = useNavigate();
  const profile = useProfile();
  const occurrenceDrawerState = useOccurrenceDrawerState();
  const noteDrawerState = useNoteDrawerState();

  const calendarMode = React.useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return pathSegments[1] || 'month';
  }, [location.pathname]);

  const [previousRangePath, nextRangePath] = React.useMemo(() => {
    const toSet = {
      days: calendarMode === 'day' ? 1 : 0,
      months: calendarMode === 'month' ? 1 : 0,
      weeks: calendarMode === 'week' ? 1 : 0,
    };

    const previousRange = focusedDate
      .subtract(toSet)
      .toString()
      .split('-')
      .map(Number)
      .join('/');

    const nextRange = focusedDate
      .add(toSet)
      .toString()
      .split('-')
      .map(Number)
      .join('/');

    return [
      `/calendar/${calendarMode}/${previousRange}`,
      `/calendar/${calendarMode}/${nextRange}`,
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

    const weekStart = startOfWeek(
      focusedDate,
      locale,
      profile?.firstDayOfWeek || 'mon'
    );
    const weekEnd = endOfWeek(
      focusedDate,
      locale,
      profile?.firstDayOfWeek || 'mon'
    );

    return todayDate.compare(weekStart) >= 0 && todayDate.compare(weekEnd) <= 0;
  }, [calendarMode, focusedDate, profile?.firstDayOfWeek, timeZone, locale]);

  const todayRangePath = React.useMemo(() => {
    const todayDate = today(timeZone);

    if (calendarMode === 'day') {
      return `/calendar/day/${todayDate.year}/${todayDate.month}/${todayDate.day}`;
    }

    if (calendarMode === 'month') {
      return `/calendar/month/${todayDate.year}/${todayDate.month}/${
        startOfMonth(todayDate).day
      }`;
    }

    const weekStart = startOfWeek(
      todayDate,
      locale,
      profile?.firstDayOfWeek
    ).add({
      days: profile?.firstDayOfWeek === 'sun' ? 4 : 3,
    });

    return `/calendar/week/${weekStart.year}/${weekStart.month}/${
      weekStart.day
    }`;
  }, [calendarMode, timeZone, locale, profile?.firstDayOfWeek]);

  return (
    <>
      <Button
        as={Link}
        size="sm"
        isIconOnly
        radius="sm"
        variant="light"
        color="secondary"
        role="navigate-back"
        to={previousRangePath}
      >
        <ArrowFatLeftIcon size={20} />
      </Button>
      {!isSameRange && (
        <Button
          as={Link}
          size="sm"
          radius="sm"
          variant="light"
          color="secondary"
          to={todayRangePath}
          className={cn(isMobile && 'min-w-fit p-0')}
          startContent={<ArrowsClockwiseIcon size={20} />}
        >
          {(!isMobile || screenWidth < 446) && 'Today'}
        </Button>
      )}
      <Button
        as={Link}
        size="sm"
        isIconOnly
        radius="sm"
        variant="light"
        color="secondary"
        to={nextRangePath}
        role="navigate-forward"
      >
        <ArrowFatRightIcon size={20} />
      </Button>
    </>
  );
};

export default CalendarNavigationButtons;
