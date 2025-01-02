/* eslint-disable */

import { useOccurrencesStore } from '@stores';
import { addDays, eachDayOfInterval, startOfDay, startOfWeek } from 'date-fns';
import { motion } from 'framer-motion';
import React from 'react';
import { useLocation } from 'react-router-dom';

import OccurrenceChip from '../calendar-month/OccurrenceChip';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekCalendar = () => {
  const { state } = useLocation();
  const { occurrences } = useOccurrencesStore();
  const [startOfTheWeek, setStartOfTheWeek] = React.useState(() => {
    const initialDate = state?.startDate || new Date();

    return startOfWeek(startOfDay(initialDate));
  });

  if (!state) {
    return (
      <div className="flex h-full w-full max-w-full flex-1 flex-col p-4">
        <h1 className="mt-2 text-center text-xl font-bold">Week Calendar</h1>
        <p className="mb-4 text-center text-sm italic text-neutral-400 dark:text-neutral-500">
          Weekly calendar is only available when navigating from the month
          calendar for now
        </p>
      </div>
    );
  }

  const { startDate }: { startDate: Date } = state;

  const days = eachDayOfInterval({
    start: startOfTheWeek,
    end: addDays(startOfTheWeek, 6),
  });

  // console.log({ startDate, startOfTheWeek, days });

  // const groupOccurrences = (dayIndex: number, hour: number) => {
  //   const day = dayIndex === 6 ? 0 : dayIndex + 1;
  //
  //   const relatedOccurrences = occurrences.filter((o) => {
  //     const date = new Date(o.timestamp);
  //     return (
  //       date.getFullYear() === year &&
  //       date.getMonth() === month &&
  //       date.getDate() === dates[dayIndex]?.day &&
  //       date.getDay() === day &&
  //       date.getHours() === hour
  //     );
  //   });
  //
  //   if (hour === 0) {
  //     console.log('relatedOccurrences', relatedOccurrences);
  //   }
  //   return Object.entries(Object.groupBy(relatedOccurrences, (o) => o.habitId));
  // };

  return (
    <div className="flex h-full w-full max-w-full flex-1 flex-col p-4">
      <h1 className="mt-2 text-center text-xl font-bold">
        {/*Week {week} of {year}*/}
        Weekly Calendar
      </h1>
      <p className="mb-4 text-center text-sm italic text-neutral-400 dark:text-neutral-500">
        Coming soon
      </p>
      {/*{[...Array(25)].map((_, hourIndex) => (*/}
      {/*  <div*/}
      {/*    key={hourIndex}*/}
      {/*    className="ml-4 flex border-b border-neutral-300 first-of-type:border-b-0 last-of-type:border-b-0 dark:border-neutral-600"*/}
      {/*  >*/}
      {/*    {[...Array(7)].map((_, dayIndex) => {*/}
      {/*      if (hourIndex === 0) {*/}
      {/*        return (*/}
      {/*          <div*/}
      {/*            key={`${hourIndex}-${dayIndex}`}*/}
      {/*            className="mb-2 flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"*/}
      {/*          >*/}
      {/*            <p className="font-bold">{WEEK_DAYS[dayIndex]}</p>*/}
      {/*          </div>*/}
      {/*        );*/}
      {/*      }*/}

      {/*      return (*/}
      {/*        <div*/}
      {/*          key={`${hourIndex}-${dayIndex}`}*/}
      {/*          className="relative h-20 flex-1 border-neutral-300 dark:border-neutral-600 [&:not(:last-of-type)]:border-r"*/}
      {/*        >*/}
      {/*          {hourIndex > 1 && dayIndex === 0 && (*/}
      {/*            <p className="absolute -left-6 -top-3 text-neutral-500 dark:text-neutral-400">*/}
      {/*              {hourIndex - 1}*/}
      {/*            </p>*/}
      {/*          )}*/}
      {/*          <div className="flex h-full flex-1 flex-wrap justify-center gap-2 overflow-x-auto overflow-y-visible p-2 md:justify-start">*/}
      {/*            {groupOccurrences(dayIndex, hourIndex - 1).map(*/}
      {/*              ([habitId, habitOccurrences]) => {*/}
      {/*                if (!habitOccurrences) {*/}
      {/*                  return null;*/}
      {/*                }*/}

      {/*                return (*/}
      {/*                  <motion.div*/}
      {/*                    key={habitId}*/}
      {/*                    initial={{ opacity: 0 }}*/}
      {/*                    animate={{ opacity: 1 }}*/}
      {/*                    exit={{ scale: 0 }}*/}
      {/*                    transition={{ duration: 0.5 }}*/}
      {/*                  >*/}
      {/*                    <OccurrenceChip*/}
      {/*                      occurrences={habitOccurrences}*/}
      {/*                      onDelete={() => null}*/}
      {/*                    />*/}
      {/*                  </motion.div>*/}
      {/*                );*/}
      {/*              }*/}
      {/*            )}*/}
      {/*          </div>*/}
      {/*        </div>*/}
      {/*      );*/}
      {/*    })}*/}
      {/*  </div>*/}
      {/*))}*/}
    </div>
  );
};

export default WeekCalendar;
