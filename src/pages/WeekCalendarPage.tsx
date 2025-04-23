import { cn } from '@heroui/react';
import {
  getDay,
  addDays,
  getWeek,
  isToday,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
  startOfToday,
  getISOWeekYear,
  eachDayOfInterval,
  eachMinuteOfInterval,
} from 'date-fns';
import { motion } from 'framer-motion';
import React from 'react';
import { useParams } from 'react-router';

import { OccurrenceChip } from '@components';
import { useUser } from '@hooks';
import { useOccurrences, useOccurrenceActions } from '@stores';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekCalendar = () => {
  const params = useParams();
  const { user } = useUser();
  const occurrences = useOccurrences();
  const { clearOccurrences, fetchOccurrences } = useOccurrenceActions();
  const [startOfTheWeek, setStartOfTheWeek] = React.useState(new Date());

  React.useEffect(() => {
    if (!user) {
      if (occurrences.length) {
        clearOccurrences();
      }

      return;
    }

    const currentWeek = startOfWeek(startOfToday());

    const {
      day = currentWeek.getDate(),
      month = currentWeek.getMonth() + 1,
      year = currentWeek.getFullYear(),
    } = params;

    const date = new Date(Number(year), Number(month) - 1, Number(day) + 1);

    const startDate = startOfWeek(startOfDay(date));

    setStartOfTheWeek(startDate);

    const rangeStart = startOfWeek(startDate);
    const rangeEnd = endOfWeek(startDate);

    void fetchOccurrences([+rangeStart, +rangeEnd]);
  }, [params, user, fetchOccurrences, clearOccurrences, occurrences.length]);

  const days = eachDayOfInterval({
    end: addDays(startOfTheWeek, 6),
    start: startOfTheWeek,
  });

  const groupOccurrences = React.useCallback(
    (dayIndex: number, hour: number) => {
      const day = dayIndex === 6 ? 0 : dayIndex + 1;

      const relatedOccurrences = occurrences.filter((o) => {
        const date = new Date(o.timestamp);

        return (
          date.getDate() === days[dayIndex].getDate() &&
          date.getDay() === day &&
          date.getHours() === hour
        );
      });

      return Object.entries(
        Object.groupBy(relatedOccurrences, (o) => {
          return o.habitId;
        })
      );
    },
    [days, occurrences]
  );

  return (
    <div className="relative my-8 flex h-full w-full max-w-full flex-1 flex-col space-y-8 px-8 py-2 lg:px-16 lg:py-4">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-bold">
          Week {getWeek(startOfTheWeek)} of {getISOWeekYear(startOfTheWeek)}
        </h1>
        <p className="text-sm italic text-stone-400 dark:text-stone-500">
          Logging & navigation coming soon
        </p>
      </div>
      <div className="flex justify-around">
        {days.map((day, dayIndex) => {
          const weekDayName = WEEK_DAYS[getDay(day) - 1] || WEEK_DAYS[6];

          return (
            <div key={dayIndex} className="group flex flex-1 flex-col gap-4">
              <div
                className={cn(
                  'space-y-2 text-center text-stone-600 dark:text-stone-300',
                  isToday(day) &&
                    'font-bold text-primary-600 dark:text-primary-400'
                )}
              >
                <h3>{weekDayName}</h3>
                <h6>{day.getDate()}</h6>
              </div>
              <div className="flex flex-col border-r border-stone-300 group-last-of-type:border-r-0 dark:border-stone-600">
                {eachMinuteOfInterval(
                  {
                    end: endOfDay(day),
                    start: startOfDay(day),
                  },
                  { step: 60 }
                ).map((minute) => {
                  const hour = minute.getHours();

                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="group/minutes-cell relative flex gap-4"
                    >
                      {dayIndex === 0 && (
                        <p className="translate-0 absolute -left-[23px] -top-[13px] w-3 basis-0 self-start text-right text-stone-600 dark:text-stone-200 md:static md:-translate-y-3 md:text-base">
                          {hour !== 0 && hour}
                        </p>
                      )}
                      <div className="flex h-20 w-full flex-wrap gap-2 overflow-x-hidden border-b border-stone-300 p-2 group-last-of-type/minutes-cell:border-b-0 dark:border-stone-500">
                        {groupOccurrences(dayIndex, hour).map(
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
    </div>
  );
};

export default WeekCalendar;
