import { useCalendarEvents } from '@context';
import { Box, Typography } from '@mui/joy';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import { useCalendarGrid } from 'react-aria';
import { CalendarState } from 'react-stately';

import MotionCalendarMonthGrid from './CalendarMonthGrid';
import DayHabitModalDialog from './DayHabitModalDialog';
import {
  StyledCalendarGridContainerDiv,
  StyledCalendarWeekDay,
} from './styled';

type CalendarGridProps = {
  state: CalendarState;
  weeksInMonth: number;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarGrid = ({ weeksInMonth, state }: CalendarGridProps) => {
  const { gridProps } = useCalendarGrid({}, state);

  const { calendarEventsByDate } = useCalendarEvents();
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
    <StyledCalendarGridContainerDiv {...gridProps}>
      <Box display="flex" mb={0.25}>
        {[...Array(7)].map((_, index) => {
          return (
            <StyledCalendarWeekDay key={index}>
              <Typography
                key={`weekLabel-${index}`}
                level="body-lg"
                fontWeight={900}
              >
                {WEEK_DAYS[index]}
              </Typography>
            </StyledCalendarWeekDay>
          );
        })}
      </Box>
      <AnimatePresence mode="wait">
        <MotionCalendarMonthGrid
          key={state.visibleRange.start.month}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          calendarEventsByDate={calendarEventsByDate}
          onDayModalDialogOpen={handleDayModalDialogOpen}
          weeksInMonth={weeksInMonth}
          state={state}
        />
      </AnimatePresence>

      <DayHabitModalDialog
        open={dayModalDialogOpen}
        onClose={handleDayModalDialogClose}
        date={activeDate}
      />
    </StyledCalendarGridContainerDiv>
  );
};

export default CalendarGrid;
