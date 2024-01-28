import { calendarService } from '@services';
import React from 'react';

import { Habit } from './Habits';
import { useSnackbar } from './Snackbar';
import { useUser } from './User';

export type CalendarEvent = {
  id: number;
  date: string;
  habit: Habit;
};

const CalendarEventsContext = React.createContext({
  fetchingCalendarEvents: false,
  calendarEvents: [] as CalendarEvent[],
  addCalendarEvent: (_: CalendarEvent) => {},
  removeCalendarEvent: (_: number) => {},
  updateHabitInsideCalendarEvents: (_: Habit) => {},
});

export const useCalendarEvents = () => {
  const context = React.useContext(CalendarEventsContext);

  if (!context) {
    throw new Error(
      'useCalendarEvents must be used within a CalendarEventsProvider'
    );
  }

  return context;
};

type Props = {
  children: React.ReactNode;
};

const CalendarEventsProvider = ({ children }: Props) => {
  const { accessToken, logout } = useUser();
  const { showSnackbar } = useSnackbar();
  const [fetchingCalendarEvents, setFetchingCalendarEvents] =
    React.useState(false);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    []
  );

  React.useEffect(() => {
    if (!accessToken) {
      clearCalendarEvents();
      return undefined;
    }

    setFetchingCalendarEvents(true);

    calendarService
      .getCalendarEvents(accessToken as string)
      .then((res) => {
        setCalendarEvents(res);
      })
      .catch(async (err) => {
        if (err.message === 'Token expired') {
          logout(false);
          showSnackbar('You have been logged out', {
            variant: 'solid',
            color: 'neutral',
          });
        }

        console.error(err);
      })
      .finally(() => {
        setFetchingCalendarEvents(false);
      });
  }, [accessToken, logout, showSnackbar]);

  const addCalendarEvent = (calendarEvent: CalendarEvent) => {
    setCalendarEvents((prevCalendarEvents) => [
      ...prevCalendarEvents,
      calendarEvent,
    ]);
  };

  const removeCalendarEvent = (id: number) => {
    setCalendarEvents((prevCalendarEvents) =>
      prevCalendarEvents.filter(
        (prevCalendarEvent) => prevCalendarEvent.id !== id
      )
    );
  };

  const updateHabitInsideCalendarEvents = (habit: Habit) => {
    setCalendarEvents((prevCalendarEvents) => {
      return prevCalendarEvents.map((prevCalendarEvent) => {
        if (prevCalendarEvent.habit.id === habit.id) {
          return {
            ...prevCalendarEvent,
            habit,
          };
        }

        return prevCalendarEvent;
      });
    });
  };

  const clearCalendarEvents = () => {
    setCalendarEvents([]);
  };

  const value = React.useMemo(
    () => ({
      fetchingCalendarEvents,
      calendarEvents,
      addCalendarEvent,
      removeCalendarEvent,
      updateHabitInsideCalendarEvents,
    }),
    [calendarEvents, fetchingCalendarEvents]
  );

  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
};

export default CalendarEventsProvider;
