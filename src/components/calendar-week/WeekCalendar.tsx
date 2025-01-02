/* eslint-disable */

import { useOccurrencesStore } from '@stores';
import {
  addDays,
  eachDayOfInterval,
  eachMinuteOfInterval,
  endOfDay,
  getDay,
  startOfDay,
  startOfWeek,
  endOfWeek,
  getISOWeekYear,
  getWeek,
} from 'date-fns';
import { motion } from 'framer-motion';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import OccurrenceChip from '../calendar-month/OccurrenceChip';
import { Button } from '@nextui-org/react';
import { ArrowFatLeft } from '@phosphor-icons/react';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekCalendar = () => {
  const { state } = useLocation();
  const { occurrences } = useOccurrencesStore();
  const [startOfTheWeek, setStartOfTheWeek] = React.useState(new Date());

  React.useEffect(() => {
    if (!state) {
      return;
    }

    setStartOfTheWeek(startOfWeek(startOfDay(state.startDate || new Date())));
  }, [state]);

  if (!state) {
    return (
      <div className="flex h-full w-full max-w-full flex-1 flex-col p-4">
        <h1 className="mt-2 text-center text-xl font-bold">Week Calendar</h1>
        <p className="mb-4 text-center text-sm italic text-stone-400 dark:text-stone-500">
          Weekly calendar is only available when navigating from the month
          calendar for now
        </p>
      </div>
    );
  }

  const { startDate }: { startDate: Date } = state;

  const days = eachDayOfInterval<Date>({
    start: startOfTheWeek,
    end: addDays(startOfTheWeek, 6),
  });

  const occurrencesInWeek = React.useMemo(() => {
    const occurrencesRange = [
      startOfTheWeek,
      endOfWeek(endOfDay(days.at(-1) || new Date())),
    ];

    return occurrences.filter((o) => {
      const date = new Date(o.timestamp);
      return date >= occurrencesRange[0] && date <= occurrencesRange[1];
    });
  }, [days]);

  const groupOccurrences = React.useCallback(
    (dayIndex: number, hour: number) => {
      const day = dayIndex === 6 ? 0 : dayIndex + 1;

      const relatedOccurrences = occurrencesInWeek.filter((o) => {
        const date = new Date(o.timestamp);
        return (
          date.getDate() === days[dayIndex].getDate() &&
          date.getDay() === day &&
          date.getHours() === hour
        );
      });

      return Object.entries(
        Object.groupBy(relatedOccurrences, (o) => o.habitId)
      );
    },
    [days]
  );

  return (
    <div className="relative my-8 flex h-full w-full max-w-full flex-1 flex-col space-y-8 px-5 py-2 lg:px-16 lg:py-4">
      <Button
        as={Link}
        to="/calendar/month"
        className="absolute left-6 top-0"
        variant="flat"
      >
        <ArrowFatLeft size={20} />
        Back
      </Button>
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold">
          Week {getWeek(startDate)} of {getISOWeekYear(startDate)}
        </h1>
        <p className="text-sm italic text-stone-400 dark:text-stone-500">
          Editing coming soon
        </p>
      </div>
      <div className="flex justify-around">
        {days.map((day, dayIndex) => {
          const weekDayName = WEEK_DAYS[getDay(day) - 1] || WEEK_DAYS[6];

          return (
            <div className="group flex flex-1 flex-col gap-2">
              <h3 className="text-center text-stone-600 dark:text-stone-300">
                {weekDayName}
              </h3>
              <div className="flex flex-col border-r border-stone-300 group-last-of-type:border-r-0 dark:border-stone-600">
                {eachMinuteOfInterval<Date>(
                  {
                    start: startOfDay(day),
                    end: endOfDay(day),
                  },
                  { step: 60 }
                ).map((minute) => {
                  const hour = minute.getHours();

                  return (
                    <div className="group/minutes-cell relative flex gap-4">
                      {dayIndex === 0 && (
                        <p className="absolute -left-4 -top-1 w-3 basis-0 -translate-y-3 self-start text-right text-stone-600 dark:text-stone-200 md:static md:text-base">
                          {hour !== 0 && hour}
                        </p>
                      )}
                      <div className="flex h-20 w-full overflow-x-hidden border-b border-stone-300 p-2 group-last-of-type/minutes-cell:border-b-0 dark:border-stone-500">
                        {groupOccurrences(dayIndex, hour).map(
                          ([habitId, habitOccurrences]) => {
                            if (!habitOccurrences) {
                              return null;
                            }

                            return (
                              <motion.div
                                key={habitId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ scale: 0 }}
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
    </div>
  );
};

export default WeekCalendar;
