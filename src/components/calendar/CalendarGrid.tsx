import { Box, Typography } from '@mui/joy';
import React from 'react';
import { useCalendarGrid } from 'react-aria';
import { type CalendarState } from 'react-stately';

import CalendarMonthGrid from './CalendarMonthGrid';
import DayHabitModalDialog from './DayHabitModalDialog';

type CalendarGridProps = {
  state: CalendarState;
  weeksInMonth: number;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarGrid = ({ weeksInMonth, state }: CalendarGridProps) => {
  const { gridProps } = useCalendarGrid({}, state);
  const [dayModalDialogOpen, setDayModalDialogOpen] = React.useState(false);
  const [activeDate, setActiveDate] = React.useState<Date | null>(null);

  const handleDayModalDialogOpen = (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => {
    setDayModalDialogOpen(true);
    setActiveDate(new Date(fullYear, monthIndex - 1, dateNumber, 12));
  };

  const handleDayModalDialogClose = () => {
    setActiveDate(null);
    setDayModalDialogOpen(false);
  };

  return (
    <div {...gridProps} className="my-2 flex flex-1 flex-col gap-0 lg:gap-4">
      <Box display="flex" mb={0.25}>
        {[...Array(7)].map((_, index) => {
          return (
            <div
              key={index}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <Typography
                key={`weekLabel-${index}`}
                level="body-lg"
                fontWeight={900}
              >
                {WEEK_DAYS[index]}
              </Typography>
            </div>
          );
        })}
      </Box>
      <CalendarMonthGrid
        onDayModalDialogOpen={handleDayModalDialogOpen}
        weeksInMonth={weeksInMonth}
        state={state}
      />

      <DayHabitModalDialog
        open={dayModalDialogOpen}
        onClose={handleDayModalDialogClose}
        date={activeDate}
      />
    </div>
  );
};

export default CalendarGrid;
