import { cn, Button, Tooltip, ScrollShadow } from '@heroui/react';
import {
  today,
  isToday,
  endOfWeek,
  startOfWeek,
  CalendarDate,
  createCalendar,
  toCalendarDate,
  getLocalTimeZone,
  toCalendarDateTime,
} from '@internationalized/date';
import {
  NoteIcon,
  NoteBlankIcon,
  CalendarBlankIcon,
  ArrowSquareLeftIcon,
  ArrowSquareRightIcon,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import capitalize from 'lodash.capitalize';
import groupBy from 'lodash.groupby';
import React from 'react';
import {
  useLocale,
  useCalendar,
  useCalendarGrid,
  useDateFormatter,
} from 'react-aria';
import { Link, useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import { OccurrenceChip } from '@components';
import { useCurrentTime, useScreenWidth } from '@hooks';
import {
  useProfile,
  useDayNotes,
  useOccurrences,
  useNoteDrawerActions,
  useCalendarRangeChange,
  useOccurrenceDrawerActions,
} from '@stores';
import { isDstTransitionDay, findDstTransitionHour } from '@utils';

import CalendarFilters from './CalendarFilters';
import CalendarNavigation from './CalendarNavigation';

const WeekCalendar = () => {
  const now = useCurrentTime();
  const changeCalendarRange = useCalendarRangeChange();
  const dayNotes = useDayNotes();
  const [isFocusedDateInitialized, setIsFocusedDateInitialized] =
    React.useState(false);
  const { isDesktop } = useScreenWidth();
  const { openNoteDrawer } = useNoteDrawerActions();
  const { openOccurrenceDrawer } = useOccurrenceDrawerActions();
  const occurrences = useOccurrences();
  const { locale } = useLocale();
  const params = useParams();
  const profile = useProfile();
  const state = useCalendarState({
    createCalendar,
    firstDayOfWeek: profile?.firstDayOfWeek,
    locale,
    visibleDuration: { weeks: 1 },
  });
  useCalendar({ firstDayOfWeek: profile?.firstDayOfWeek }, state);
  const { gridProps, weekDays } = useCalendarGrid(
    {
      firstDayOfWeek: profile?.firstDayOfWeek,
      weekdayStyle: isDesktop ? 'long' : 'short',
    },
    state
  );

  const firstDayOfWeek = React.useMemo(() => {
    if (profile) {
      return profile.firstDayOfWeek;
    }

    return weekDays[0].slice(0, 3).toLowerCase();
  }, [profile, weekDays]);

  React.useEffect(() => {
    if (!isFocusedDateInitialized) {
      return;
    }

    const focusedDateTime = toCalendarDateTime(state.focusedDate);

    const rangeStart = startOfWeek(
      focusedDateTime,
      locale,
      profile?.firstDayOfWeek
    );
    const rangeEnd = endOfWeek(
      focusedDateTime,
      locale,
      profile?.firstDayOfWeek
    ).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    changeCalendarRange([rangeStart, rangeEnd]);
  }, [
    state.focusedDate,
    profile?.firstDayOfWeek,
    changeCalendarRange,
    locale,
    isFocusedDateInitialized,
  ]);

  React.useEffect(() => {
    const currentWeek = startOfWeek(
      today(getLocalTimeZone()),
      locale,
      profile?.firstDayOfWeek
    ).add({ days: firstDayOfWeek === 'sun' ? 4 : 3 });

    const {
      day = currentWeek.day,
      month = currentWeek.month,
      year = currentWeek.year,
    } = params;

    const paramsDate = new CalendarDate(
      Number(year),
      Number(month),
      Number(day)
    );

    if (state.focusedDate.toString() !== paramsDate.toString()) {
      state.setFocusedDate(toCalendarDate(paramsDate));
      setIsFocusedDateInitialized(true);
    }
  }, [state, params, locale, profile?.firstDayOfWeek, firstDayOfWeek]);

  const hasNote = React.useCallback(
    (date: CalendarDate) => {
      return dayNotes.some((note) => {
        return note.periodDate === date.toString();
      });
    },
    [dayNotes]
  );

  const groupOccurrences = React.useCallback(
    (day: CalendarDate, hour: number) => {
      const dayOccurrences = occurrences[day.toString()] || {};
      const relatedOccurrences = Object.values(dayOccurrences).filter(
        ({ hasSpecificTime, occurredAt }) => {
          const occurrenceDate = occurredAt;
          const matchesDay =
            occurrenceDate.year === day.year &&
            occurrenceDate.month === day.month &&
            occurrenceDate.day === day.day;

          if (!hasSpecificTime) {
            return matchesDay && hour === 0;
          }

          return matchesDay && occurrenceDate.hour === hour;
        }
      );

      return Object.entries(
        groupBy(relatedOccurrences, (o) => {
          return o.habitId;
        })
      );
    },
    [occurrences]
  );

  const timeZone = getLocalTimeZone();
  const monthFormatter = useDateFormatter({ month: 'long' });
  const dayFormatter = useDateFormatter({ day: 'numeric', month: 'short' });

  const monthInfo = React.useMemo(() => {
    const weekStart = startOfWeek(
      state.focusedDate,
      locale,
      profile?.firstDayOfWeek
    );
    const thursday = weekStart.add({
      days: firstDayOfWeek === 'sun' ? 4 : 3,
    });

    const monthStart = new CalendarDate(thursday.year, thursday.month, 1);
    const lastDay = new Date(thursday.year, thursday.month, 0).getDate();
    const monthEnd = new CalendarDate(thursday.year, thursday.month, lastDay);

    const monthName = monthFormatter.format(thursday.toDate(timeZone));
    const rangeStart = dayFormatter.format(monthStart.toDate(timeZone));
    const rangeEnd = dayFormatter.format(monthEnd.toDate(timeZone));

    return {
      label: `${monthName}: ${rangeStart} – ${rangeEnd}`,
      path: `/calendar/month/${thursday.year}/${thursday.month}/1`,
    };
  }, [
    state.focusedDate,
    locale,
    profile?.firstDayOfWeek,
    timeZone,
    monthFormatter,
    dayFormatter,
    firstDayOfWeek,
  ]);

  return (
    <ScrollShadow
      orientation="horizontal"
      className="relative w-full overflow-y-scroll"
    >
      <div className="sticky left-0 flex flex-col items-center justify-center gap-4 md:flex-row">
        <div className="flex items-center justify-center gap-2">
          <Tooltip closeDelay={0} content={monthInfo.label}>
            <Button
              as={Link}
              size="sm"
              radius="sm"
              variant="light"
              color="secondary"
              to={monthInfo.path}
              className="min-w-fit gap-1 px-2"
              aria-label={`Go to month view: ${monthInfo.label}`}
              startContent={
                <ArrowSquareLeftIcon weight="bold" size={isDesktop ? 18 : 14} />
              }
            >
              <span className="hidden sm:inline">{monthInfo.label}</span>
            </Button>
          </Tooltip>
          <CalendarNavigation focusedDate={state.focusedDate} />
        </div>
        <div className="w-10/12 md:w-auto">
          <CalendarFilters />
        </div>
      </div>
      <div
        {...gridProps}
        className="flex min-w-lg justify-around px-8 py-4 lg:px-16"
      >
        {state
          .getDatesInWeek(firstDayOfWeek === 'sun' ? 0 : 1)
          .map((day, dayIndex) => {
            if (!day) {
              return null;
            }

            const isNoteAdded = hasNote(day);
            const dstType = isDstTransitionDay(day, getLocalTimeZone());
            const dstHour = dstType
              ? findDstTransitionHour(day, getLocalTimeZone())
              : null;

            return (
              <div
                key={dayIndex}
                className="group flex min-w-32 flex-1 flex-col gap-4"
              >
                <div
                  className={cn(
                    'space-y-2 text-center text-stone-600 dark:text-stone-300',
                    isToday(day, state.timeZone) &&
                      'text-primary-600 dark:text-primary-400 font-bold'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <h3>{capitalize(weekDays[dayIndex])}</h3>
                    <div className="flex items-center justify-center gap-0.5 md:gap-2">
                      <Tooltip
                        closeDelay={0}
                        content={isNoteAdded ? 'Edit note' : 'Add note'}
                      >
                        <Button
                          radius="sm"
                          variant="light"
                          color={isNoteAdded ? 'primary' : 'secondary'}
                          aria-label={isNoteAdded ? 'Edit note' : 'Add note'}
                          onPress={() => {
                            openNoteDrawer(day, 'day');
                          }}
                          className={cn(
                            'h-5 w-5 min-w-fit px-0 opacity-100 group-hover:opacity-100 focus:opacity-100 lg:h-6 lg:w-6',
                            isNoteAdded && 'opacity-100'
                          )}
                        >
                          {isNoteAdded ? (
                            <NoteIcon
                              weight="bold"
                              size={isDesktop ? 18 : 14}
                            />
                          ) : (
                            <NoteBlankIcon
                              weight="bold"
                              size={isDesktop ? 18 : 14}
                            />
                          )}
                        </Button>
                      </Tooltip>
                      <Tooltip closeDelay={0} content="Log occurrence">
                        <Button
                          radius="sm"
                          variant="light"
                          color="secondary"
                          aria-label="Log occurrence"
                          className="h-5 w-5 min-w-fit px-0 lg:h-6 lg:w-6"
                          onPress={() => {
                            openOccurrenceDrawer({ dayToLog: day });
                          }}
                        >
                          <CalendarBlankIcon
                            weight="bold"
                            size={isDesktop ? 18 : 14}
                          />
                        </Button>
                      </Tooltip>
                      <Tooltip closeDelay={0} content="Open day">
                        <Button
                          as={Link}
                          radius="sm"
                          variant="light"
                          color="secondary"
                          aria-label="Open day"
                          className="h-5 w-5 min-w-fit px-0 lg:h-6 lg:w-6"
                          to={`/calendar/day/${day.year}/${day.month}/${day.day}`}
                        >
                          <ArrowSquareRightIcon
                            weight="bold"
                            size={isDesktop ? 18 : 14}
                          />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                  <h6>{day.day}</h6>
                </div>
                <div
                  className={cn(
                    'flex flex-col border-r border-stone-300 group-last-of-type:border-r-0 dark:border-stone-600',
                    isToday(day, state.timeZone) &&
                      'to-background-100 dark:to-background-500 bg-linear-to-b from-transparent from-0% to-[4px]'
                  )}
                >
                  {[...Array(24).keys()].map((hour) => {
                    const isSkippedHour =
                      dstType === 'spring' && hour === dstHour;
                    const isDuplicatedHour =
                      dstType === 'fall' &&
                      dstHour !== null &&
                      hour === dstHour - 1;

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={cn(
                          'group/minutes-cell relative flex gap-4',
                          isSkippedHour && 'opacity-40'
                        )}
                      >
                        {dayIndex === 0 && (
                          <p className="absolute -top-3.25 -left-5.75 w-3 basis-0 translate-0 self-start text-right text-stone-600 md:static md:-translate-y-3 md:text-base dark:text-stone-200">
                            {hour !== 0 && hour}
                          </p>
                        )}
                        <div
                          className={cn(
                            'flex h-20 w-full flex-wrap gap-2 overflow-x-hidden border-b border-stone-300 p-2 group-last-of-type/minutes-cell:border-b-0 dark:border-stone-500',
                            isSkippedHour &&
                              'bg-stone-200/50 dark:bg-stone-700/50',
                            isDuplicatedHour &&
                              'border-l-warning-400 dark:border-l-warning-500 border-l-3'
                          )}
                        >
                          {isSkippedHour && (
                            <p className="text-xs text-stone-400 italic dark:text-stone-500">
                              DST skip
                            </p>
                          )}
                          {isDuplicatedHour && (
                            <p className="text-warning-500 dark:text-warning-400 text-xs italic">
                              DST repeat
                            </p>
                          )}
                          {isToday(day, state.timeZone) &&
                            now.getHours() === hour && (
                              <div
                                className="bg-primary absolute right-0 left-0 z-10 h-0.5"
                                style={{
                                  top: `${(now.getMinutes() / 60) * 100}%`,
                                }}
                              />
                            )}
                          {groupOccurrences(day, hour).map(
                            ([habitId, habitOccurrences]) => {
                              if (!habitOccurrences) {
                                return null;
                              }

                              return (
                                <motion.div
                                  key={habitId}
                                  exit={{ scale: 0 }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <OccurrenceChip
                                    occurrences={habitOccurrences}
                                  />
                                </motion.div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </ScrollShadow>
  );
};

export default WeekCalendar;
