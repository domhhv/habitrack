import {
  type Habit,
  type CalendarEvent,
  useSnackbar,
  useUser,
  CalendarEventsContext,
  type CalendarEventsMap,
  type CreatedCalendarEvent,
} from '@context';
import { calendarService } from '@services';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const CalendarEventsProvider = ({ children }: Props) => {
  const { user, logout } = useUser();
  const { showSnackbar } = useSnackbar();

  const [addingCalendarEvent, setAddingCalendarEvent] = React.useState(false);
  const [fetchingCalendarEvents, setFetchingCalendarEvents] =
    React.useState(false);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEventsMap>(
    {}
  );
  const [calendarEventIdBeingDeleted, setCalendarEventIdBeingDeleted] =
    React.useState(0);

  React.useEffect(() => {
    if (!user.accessToken) {
      clearCalendarEvents();
      return undefined;
    }

    setFetchingCalendarEvents(true);

    calendarService
      .getCalendarEvents(user)
      .then((res) => {
        const calendarEvents = res.reduce((acc, calendarEvent) => {
          return { ...acc, [calendarEvent.id]: calendarEvent };
        }, {});
        setCalendarEvents(calendarEvents);
      })
      .catch(async (err) => {
        console.error(err);
      })
      .finally(() => {
        setFetchingCalendarEvents(false);
      });
  }, [user, logout, showSnackbar]);

  const addCalendarEvent = React.useCallback(
    async (calendarEvent: CreatedCalendarEvent) => {
      try {
        setAddingCalendarEvent(true);

        const newCalendarEvent = await calendarService.createCalendarEvent(
          calendarEvent,
          user
        );

        setCalendarEvents((prevCalendarEvents) => ({
          ...prevCalendarEvents,
          [newCalendarEvent.id]: newCalendarEvent,
        }));

        showSnackbar('Your habit entry has been added to the calendar!', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
      } catch (e) {
        showSnackbar('Something went wrong while adding your habit', {
          color: 'danger',
          dismissible: true,
        });

        console.error(e);
      } finally {
        setAddingCalendarEvent(false);
      }
    },
    [user, showSnackbar]
  );

  const removeCalendarEvent = React.useCallback(
    async (id: number) => {
      try {
        setCalendarEventIdBeingDeleted(id);

        await calendarService.destroyCalendarEvent(id, user);

        setCalendarEvents((prevCalendarEvents) => {
          const nextCalendarEvents = { ...prevCalendarEvents };
          delete nextCalendarEvents[id];
          return nextCalendarEvents;
        });

        showSnackbar('Your habit entry has been deleted from the calendar.', {
          dismissible: true,
        });
      } catch (error) {
        showSnackbar('Something went wrong while removing your habit entry', {
          color: 'danger',
          dismissible: true,
        });

        console.error(error);
      } finally {
        setCalendarEventIdBeingDeleted(0);
      }
    },
    [user, showSnackbar]
  );

  const updateCalendarEvent = (calendarEvent: CalendarEvent) => {
    // TODO: add service call to update calendar event
    setCalendarEvents((prevCalendarEvents) => ({
      ...prevCalendarEvents,
      [calendarEvent.id]: calendarEvent,
    }));
  };

  const updateHabitInsideCalendarEvents = (habit: Habit) => {
    setCalendarEvents((prevCalendarEvents) => {
      const nextCalendarEvents = { ...prevCalendarEvents };

      Object.values(nextCalendarEvents).forEach((calendarEvent) => {
        if (calendarEvent.habit.id === habit.id) {
          calendarEvent.habit = habit;
        }
      });

      return nextCalendarEvents;
    });
  };

  const removeCalendarEventsByHabitId = (habitId: number) => {
    setCalendarEvents((prevCalendarEvents) => {
      const nextCalendarEvents = { ...prevCalendarEvents };

      Object.values(nextCalendarEvents).forEach((calendarEvent) => {
        if (calendarEvent.habit.id === habitId) {
          delete nextCalendarEvents[calendarEvent.id];
        }
      });

      return nextCalendarEvents;
    });
  };

  const clearCalendarEvents = () => {
    setCalendarEvents([]);
  };

  const value = React.useMemo(
    () => ({
      addingCalendarEvent,
      fetchingCalendarEvents,
      calendarEventIdBeingDeleted,
      calendarEvents,
      addCalendarEvent,
      removeCalendarEvent,
      removeCalendarEventsByHabitId,
      updateCalendarEvent,
      updateHabitInsideCalendarEvents,
    }),
    [
      addingCalendarEvent,
      fetchingCalendarEvents,
      calendarEvents,
      calendarEventIdBeingDeleted,
      addCalendarEvent,
      removeCalendarEvent,
    ]
  );

  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
};

export default CalendarEventsProvider;
