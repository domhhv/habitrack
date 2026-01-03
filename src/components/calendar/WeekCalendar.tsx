import { cn, Button, Tooltip, ScrollShadow } from '@heroui/react';
import {
  isToday,
  fromDate,
  CalendarDate,
  createCalendar,
  toCalendarDate,
  toCalendarDateTime,
} from '@internationalized/date';
import {
  NoteIcon,
  CaretLeftIcon,
  NoteBlankIcon,
  CaretRightIcon,
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import capitalize from 'lodash.capitalize';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useLocale, useCalendar, useCalendarGrid } from 'react-aria';
import { Link, useParams, useNavigate } from 'react-router';
import { useCalendarState } from 'react-stately';

import { OccurrenceChip } from '@components';
import { useScreenWidth } from '@hooks';
import {
  useDayNotes,
  useOccurrences,
  useNoteActions,
  useOccurrenceActions,
  useNoteDrawerActions,
} from '@stores';
import { toSqlDate, getISOWeek, getISOWeekYear } from '@utils';

const WeekCalendar = () => {
  const dayNotes = useDayNotes();
  const { isDesktop } = useScreenWidth();
  const { openNoteDrawer } = useNoteDrawerActions();
  const occurrences = useOccurrences();
  const [fetchedWeekYear, setFetchedWeekYear] = React.useState('');
  const { fetchOccurrences } = useOccurrenceActions();
  const { fetchNotes } = useNoteActions();
  const { locale } = useLocale();
  const params = useParams();
  const navigate = useNavigate();
  const state = useCalendarState({
    createCalendar,
    locale,
    visibleDuration: { weeks: 1 },
    defaultValue:
      params.day && params.month && params.year
        ? new CalendarDate(+params.year, +params.month, +params.day)
        : undefined,
  });
  useCalendar({}, state);
  const { gridProps, weekDays } = useCalendarGrid(
    {
      weekdayStyle: isDesktop ? 'long' : 'short',
    },
    state
  );

  React.useEffect(() => {
    const currentWeek = state.visibleRange.start;

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
      state.setFocusedDate(paramsDate);
    }

    if (fetchedWeekYear === state.focusedDate.toString()) {
      return;
    }

    setFetchedWeekYear(state.focusedDate.toString());

    const rangeStart = state.visibleRange.start;
    const rangeEnd = toCalendarDateTime(state.visibleRange.end).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });

    void fetchOccurrences([
      +rangeStart.toDate(state.timeZone),
      +rangeEnd.toDate(state.timeZone),
    ]);
    void fetchNotes([rangeStart, toCalendarDate(rangeEnd)]);
  }, [
    fetchNotes,
    state.timeZone,
    fetchedWeekYear,
    fetchOccurrences,
    state,
    params,
  ]);

  const hasNote = React.useCallback(
    (date: CalendarDate) => {
      return dayNotes.some((note) => {
        return note.periodDate === toSqlDate(date);
      });
    },
    [dayNotes]
  );

  const [previousWeekPath, nextWeekPath] = React.useMemo(() => {
    const previousWeek = state.visibleRange.start
      .subtract({ weeks: 1 })
      .toString()
      .split('-')
      .map(Number)
      .join('/');

    const nextWeek = state.visibleRange.start
      .add({ weeks: 1 })
      .toString()
      .split('-')
      .map(Number)
      .join('/');

    return [`/calendar/week/${previousWeek}`, `/calendar/week/${nextWeek}`];
  }, [state.visibleRange.start]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(previousWeekPath);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(nextWeekPath);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previousWeekPath, nextWeekPath, navigate]);

  const groupOccurrences = React.useCallback(
    (day: CalendarDate, hour: number) => {
      const relatedOccurrences = occurrences.filter((o) => {
        const occurrenceDate = fromDate(new Date(o.timestamp), state.timeZone);
        const matchesDay =
          occurrenceDate.year === day.year &&
          occurrenceDate.month === day.month &&
          occurrenceDate.day === day.day;

        if (!o.hasSpecificTime) {
          return matchesDay && hour === 0;
        }

        return matchesDay && occurrenceDate.hour === hour;
      });

      return Object.entries(
        groupBy(relatedOccurrences, (o) => {
          return o.habitId;
        })
      );
    },
    [occurrences, state.timeZone]
  );

  return (
    <ScrollShadow
      orientation="horizontal"
      className="relative w-full overflow-y-scroll"
    >
      <div className="flex items-center justify-center gap-4">
        <Button
          as={Link}
          isIconOnly
          variant="light"
          to={previousWeekPath}
          aria-label="Previous week"
          className="h-8 w-8 min-w-0 rounded-lg"
        >
          <CaretLeftIcon />
        </Button>
        <h1 className="text-xl font-bold">
          Week{' '}
          {getISOWeek(
            state.visibleRange.start.add({ days: 1 }).toDate(state.timeZone)
          )}{' '}
          of {getISOWeekYear(state.visibleRange.start.toDate(state.timeZone))}
        </h1>
        <Button
          as={Link}
          isIconOnly
          variant="light"
          to={nextWeekPath}
          aria-label="Next week"
          className="h-8 w-8 min-w-0 rounded-lg"
        >
          <CaretRightIcon />
        </Button>
      </div>
      <div
        {...gridProps}
        className="flex min-w-lg justify-around px-8 py-2 lg:px-16 lg:py-4"
      >
        {state.getDatesInWeek(0).map((day, dayIndex) => {
          if (!day) {
            return null;
          }

          const isNoteAdded = hasNote(day);

          return (
            <div key={dayIndex} className="group flex flex-1 flex-col gap-4">
              <div
                className={cn(
                  'space-y-2 text-center text-stone-600 dark:text-stone-300',
                  isToday(day, state.timeZone) &&
                    'text-primary-600 dark:text-primary-400 font-bold'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <h3>{capitalize(weekDays[dayIndex])}</h3>
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
                        <NoteIcon weight="bold" size={isDesktop ? 18 : 14} />
                      ) : (
                        <NoteBlankIcon
                          weight="bold"
                          size={isDesktop ? 18 : 14}
                        />
                      )}
                    </Button>
                  </Tooltip>
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
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="group/minutes-cell relative flex gap-4"
                    >
                      {dayIndex === 0 && (
                        <p className="absolute -top-3.25 -left-5.75 w-3 basis-0 translate-0 self-start text-right text-stone-600 md:static md:-translate-y-3 md:text-base dark:text-stone-200">
                          {hour !== 0 && hour}
                        </p>
                      )}
                      <div className="flex h-20 w-full flex-wrap gap-2 overflow-x-hidden border-b border-stone-300 p-2 group-last-of-type/minutes-cell:border-b-0 dark:border-stone-500">
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
                                  timeZone={state.timeZone}
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
