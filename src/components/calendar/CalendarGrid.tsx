import { CalendarEvent, useCalendarEvents } from '@context';
import { getWeeksInMonth } from '@internationalized/date';
import { CalendarDate } from '@internationalized/date';
import { Box, Typography } from '@mui/joy';
// import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useCalendarGrid, useLocale } from 'react-aria';
import { CalendarState } from 'react-stately';

import CalendarCell from './CalendarCell';
import DayHabitModalDialog from './DayHabitModalDialog';
import {
  StyledCalendarContainerDiv,
  StyledCalendarWeekDay,
  StyledCalendarWeekRow,
} from './styled';

type Props = {
  state: CalendarState;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarGrid({ state }: Props) {
  const { locale } = useLocale();
  const { gridProps } = useCalendarGrid({}, state);

  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  const { calendarEvents } = useCalendarEvents();
  const [dayModalDialogOpen, setDayModalDialogOpen] = React.useState(false);
  const [activeDate, setActiveDate] = React.useState<Date | null>(null);

  const handleDayModalDialogOpen = (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => {
    setDayModalDialogOpen(true);
    setActiveDate(new Date(fullYear, monthIndex, dateNumber));
  };

  const handleDayModalDialogClose = () => {
    setActiveDate(null);
    setDayModalDialogOpen(false);
  };

  const calendarEventsByDate = calendarEvents?.reduce(
    (acc, event) => {
      const date = new Date(event.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const key = `${year}-${month}-${day}`;
      if (!acc[key]) {
        acc[key] = [event];
      } else {
        acc[key].push(event);
      }
      return acc;
    },
    {} as Record<string, CalendarEvent[]>
  );

  return (
    <StyledCalendarContainerDiv {...gridProps}>
      <Box display="flex" mb={0.25}>
        {[...Array(7)].map((_, index) => {
          return (
            <StyledCalendarWeekDay key={index}>
              <Typography key={`weekLabel-${index}`} level="body-sm">
                {WEEK_DAYS[index]}
              </Typography>
            </StyledCalendarWeekDay>
          );
        })}
      </Box>
      {/* TODO: Uncomment with flex layout preserved */}
      {/*<AnimatePresence mode="wait">*/}
      {/*  <motion.div*/}
      {/*    key={state.visibleRange.start.month}*/}
      {/*    initial={{ opacity: 0 }}*/}
      {/*    animate={{ opacity: 1 }}*/}
      {/*    exit={{ opacity: 0 }}*/}
      {/*  >*/}
      {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
        <StyledCalendarWeekRow key={weekIndex}>
          {state
            .getDatesInWeek(weekIndex)
            .map((calendarDate: CalendarDate | null) => {
              if (!calendarDate) {
                return null;
              }

              const rangeStatus =
                calendarDate.month < state.visibleRange.start.month
                  ? 'below-range'
                  : calendarDate.month > state.visibleRange.start.month
                    ? 'above-range'
                    : 'in-range';

              return (
                <CalendarCell
                  key={`${calendarDate.month}-${calendarDate.day}-${calendarDate.year}`}
                  dateNumber={calendarDate.day}
                  monthIndex={calendarDate.month}
                  fullYear={calendarDate.year}
                  onClick={handleDayModalDialogOpen}
                  events={
                    calendarEventsByDate[
                      `${calendarDate.year}-${calendarDate.month}-${calendarDate.day}`
                    ] || []
                  }
                  rangeStatus={rangeStatus}
                  onNavigateBack={state.focusPreviousPage}
                  onNavigateForward={state.focusNextPage}
                />
              );
            })}
        </StyledCalendarWeekRow>
      ))}
      {/*  </motion.div>*/}
      {/*</AnimatePresence>*/}

      <DayHabitModalDialog
        open={dayModalDialogOpen}
        onClose={handleDayModalDialogClose}
        date={activeDate}
      />
    </StyledCalendarContainerDiv>
  );
}
