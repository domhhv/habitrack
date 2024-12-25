import React from 'react';
import { useCalendarGrid } from 'react-aria';
import { type CalendarState } from 'react-stately';

import CalendarMonthGrid from './CalendarMonthGrid';

type CalendarGridProps = {
  state: CalendarState;
  onDayModalDialogOpen: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarGrid = ({ state, onDayModalDialogOpen }: CalendarGridProps) => {
  const { gridProps } = useCalendarGrid({}, state);

  return (
    <div {...gridProps} className="flex flex-1 flex-col gap-0 lg:gap-4">
      <div className="mb-1 flex">
        {[...Array(7)].map((_, index) => {
          return (
            <div
              key={index}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <p className="font-bold">{WEEK_DAYS[index]}</p>
            </div>
          );
        })}
      </div>

      <CalendarMonthGrid
        onDayModalDialogOpen={onDayModalDialogOpen}
        state={state}
      />
    </div>
  );
};

export default CalendarGrid;
