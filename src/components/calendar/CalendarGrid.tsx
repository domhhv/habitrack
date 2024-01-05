import { CalendarEvent, CalendarEventsContext } from '@context';
import { getWeeksInMonth } from '@internationalized/date';
import { CalendarDate } from '@internationalized/date';
import { Box, styled, Typography } from '@mui/joy';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useCalendarGrid, useLocale } from 'react-aria';
import { CalendarState } from 'react-stately';

import CalendarDay from './CalendarDay';
import DayHabitModalDialog from './DayHabitModalDialog';

type Props = {
  state: CalendarState;
};

const StyledCalendarContainerDiv = styled('div')(({ theme }) => ({
  display: 'inline-block',
  margin: `${theme.spacing(2)} auto 0`,
}));

const StyledCalendarWeekDay = styled('div')(() => ({
  width: 150,
  height: 24,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledCalendarWeekRow = styled('div')(() => ({
  display: 'flex',
  '&:last-of-type': {
    borderBottom: '1px solid',
  },
}));

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarGrid({ state }: Props) {
  const { locale } = useLocale();
  const { gridProps } = useCalendarGrid({}, state);

  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  const { calendarEvents } = React.useContext(CalendarEventsContext);
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

  const calendarEventsByDate = calendarEvents.reduce(
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
              <Typography
                key={`weekLabel-${index}`}
                level="body-sm"
                className="calendar-week-day-label"
              >
                {WEEK_DAYS[index]}
              </Typography>
            </StyledCalendarWeekDay>
          );
        })}
      </Box>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${state.value}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
            <StyledCalendarWeekRow key={weekIndex}>
              {state
                .getDatesInWeek(weekIndex)
                .map((calendarDate: CalendarDate | null) => {
                  if (!calendarDate) {
                    return null;
                  }

                  const rangeStatus =
                    state.visibleRange.start.month < calendarDate.month
                      ? 'below-range'
                      : state.visibleRange.start.month > calendarDate.month
                        ? 'above-range'
                        : 'in-range';

                  return (
                    <CalendarDay
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
                    />
                  );
                })}
            </StyledCalendarWeekRow>
          ))}
        </motion.div>
      </AnimatePresence>

      <DayHabitModalDialog
        open={dayModalDialogOpen}
        onClose={handleDayModalDialogClose}
        date={activeDate}
      />
    </StyledCalendarContainerDiv>
  );
}
