import {
  type Habit,
  type CalendarEvent,
  useSnackbar,
  useUser,
  CalendarEventsContext,
} from '@context';
import { calendarService } from '@services';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const CalendarEventsProvider = ({ children }: Props) => {
  const {
    user: { token },
    logout,
  } = useUser();
  const { showSnackbar } = useSnackbar();
  const [fetchingCalendarEvents, setFetchingCalendarEvents] =
    React.useState(false);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    []
  );

  React.useEffect(() => {
    if (!token) {
      clearCalendarEvents();
      return undefined;
    }

    setFetchingCalendarEvents(true);

    calendarService
      .getCalendarEvents(token)
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
  }, [token, logout, showSnackbar]);

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
