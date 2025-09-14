import { cn, Button } from '@heroui/react';
import {
  isToday,
  fromDate,
  CalendarDate,
  createCalendar,
  toCalendarDate,
  toCalendarDateTime,
} from '@internationalized/date';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import capitalize from 'lodash.capitalize';
import groupBy from 'lodash.groupby';
import React from 'react';
import { useLocale, useCalendar, useCalendarGrid } from 'react-aria';
import { useParams } from 'react-router';
import { useCalendarState } from 'react-stately';

import { OccurrenceChip } from '@components';
import { useOccurrences, useNoteActions, useOccurrenceActions } from '@stores';
import { getISOWeek, getISOWeekYear } from '@utils';

const WeekCalendar = () => {
  const occurrences = useOccurrences();
  const [fetchedWeekYear, setFetchedWeekYear] = React.useState('');
  const { fetchOccurrences } = useOccurrenceActions();
  const { fetchNotes } = useNoteActions();
  const { locale } = useLocale();
  const { day, month, year } = useParams();
  const state = useCalendarState({
    createCalendar,
    locale,
    visibleDuration: { weeks: 1 },
    defaultValue:
      day && month && year ? new CalendarDate(+year, +month, +day) : undefined,
  });
  useCalendar({}, state);
  const { gridProps, weekDays } = useCalendarGrid(
    {
      weekdayStyle: 'long',
    },
    state
  );

  React.useEffect(() => {
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
    state.focusedDate,
    state.visibleRange.end,
    state.visibleRange.start,
  ]);

  const navigateToPreviousWeek = React.useCallback(() => {
    const previousWeekDate = state.visibleRange.start.subtract({ weeks: 1 });
    state.setFocusedDate(previousWeekDate);
  }, [state]);

  const navigateToNextWeek = React.useCallback(() => {
    const nextWeekDate = state.visibleRange.start.add({ weeks: 1 });
    state.setFocusedDate(nextWeekDate);
  }, [state]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateToPreviousWeek();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateToNextWeek();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateToNextWeek, navigateToPreviousWeek]);

  const groupOccurrences = React.useCallback(
    (day: CalendarDate, hour: number) => {
      const relatedOccurrences = occurrences.filter((o) => {
        const occurrenceDate = fromDate(new Date(o.timestamp), state.timeZone);

        return (
          occurrenceDate.year === day.year &&
          occurrenceDate.month === day.month &&
          occurrenceDate.day === day.day &&
          occurrenceDate.hour === hour
        );
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
    <>
      <div className="flex items-center justify-center gap-4">
        <Button
          isIconOnly
          variant="flat"
          aria-label="Previous week"
          onPress={navigateToPreviousWeek}
          className="h-8 w-8 min-w-0 rounded-lg"
        >
          <CaretLeft />
        </Button>
        <h1 className="text-xl font-bold">
          Week {getISOWeek(state.visibleRange.start.toDate(state.timeZone))} of{' '}
          {getISOWeekYear(state.visibleRange.start.toDate(state.timeZone))}
        </h1>
        <Button
          isIconOnly
          variant="flat"
          aria-label="Next week"
          onPress={navigateToNextWeek}
          className="h-8 w-8 min-w-0 rounded-lg"
        >
          <CaretRight />
        </Button>
      </div>
      <div {...gridProps} className="flex justify-around">
        {state.getDatesInWeek(0).map((day, dayIndex) => {
          if (!day) {
            return null;
          }

          return (
            <div key={dayIndex} className="group flex flex-1 flex-col gap-4">
              <div
                className={cn(
                  'space-y-2 text-center text-stone-600 dark:text-stone-300',
                  isToday(day, state.timeZone) &&
                    'text-primary-600 dark:text-primary-400 font-bold'
                )}
              >
                <h3>{capitalize(weekDays[dayIndex])}</h3>
                <h6>{day?.day}</h6>
              </div>
              <div
                className={cn(
                  'flex flex-col border-r border-stone-300 group-last-of-type:border-r-0 dark:border-stone-600',
                  isToday(day, state.timeZone) &&
                    'to-background-100 bg-linear-to-b from-transparent from-0% to-[4px]'
                )}
              >
                {[...Array(24).keys()].map((hour) => {
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="group/minutes-cell relative flex gap-4"
                    >
                      {dayIndex === 0 && (
                        <p className="absolute -top-[13px] -left-[23px] w-3 basis-0 translate-0 self-start text-right text-stone-600 md:static md:-translate-y-3 md:text-base dark:text-stone-200">
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
    </>
  );
};

export default WeekCalendar;
