import {
  type CalendarEvent,
  useSnackbar,
  CalendarEventsContext,
  type CalendarEventsDateMap,
} from '@context';
import {
  createCalendarEvent,
  destroyCalendarEvent,
  listCalendarEvents,
  type PostEntity,
} from '@services';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import React from 'react';

type Props = {
  children: React.ReactNode;
  range: [number, number];
};

const CalendarEventsProvider = ({ children, range }: Props) => {
  const { showSnackbar } = useSnackbar();
  const user = useUser();
  const supabase = useSupabaseClient();

  const [addingCalendarEvent, setAddingCalendarEvent] = React.useState(false);
  const [fetchingCalendarEvents, setFetchingCalendarEvents] =
    React.useState(false);
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>(
    []
  );
  const [calendarEventsByDate, setCalendarEventsByDate] =
    React.useState<CalendarEventsDateMap>({});
  const [calendarEventIdBeingDeleted, setCalendarEventIdBeingDeleted] =
    React.useState(0);

  const fetchCalendarEvents = React.useCallback(async () => {
    setFetchingCalendarEvents(true);
    const calendarEvents = await listCalendarEvents(range);
    setCalendarEvents(calendarEvents);
    setFetchingCalendarEvents(false);
  }, [range]);

  React.useEffect(() => {
    void fetchCalendarEvents();
  }, [range, fetchCalendarEvents]);

  React.useEffect(() => {
    void fetchCalendarEvents();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearCalendarEvents();
      }

      if (event === 'SIGNED_IN') {
        void fetchCalendarEvents();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [user, supabase, showSnackbar, fetchCalendarEvents]);

  React.useEffect(() => {
    const calendarEventsByDate = calendarEvents.reduce(
      (acc, calendarEvent) => {
        const { day } = calendarEvent;
        if (!acc[day]) {
          acc[day] = [calendarEvent];
        } else {
          acc[day].push(calendarEvent);
        }
        return acc;
      },
      {} as Record<string, CalendarEvent[]>
    );

    setCalendarEventsByDate(calendarEventsByDate);
  }, [calendarEvents]);

  const addCalendarEvent = React.useCallback(
    async (calendarEvent: PostEntity<CalendarEvent>) => {
      try {
        setAddingCalendarEvent(true);

        const newCalendarEvent = await createCalendarEvent(calendarEvent);

        setCalendarEvents((prevCalendarEvents) => [
          ...prevCalendarEvents,
          newCalendarEvent,
        ]);

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
    [showSnackbar]
  );

  const removeCalendarEvent = React.useCallback(
    async (id: number) => {
      try {
        setCalendarEventIdBeingDeleted(id);

        await destroyCalendarEvent(id);

        setCalendarEvents((prevCalendarEvents) => {
          const nextCalendarEvents = [...prevCalendarEvents];
          const indexToRemove = nextCalendarEvents.findIndex(
            (event) => event.id === id
          );
          delete nextCalendarEvents[indexToRemove];
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
    [showSnackbar]
  );

  const removeCalendarEventsByHabitId = (habitId: number) => {
    setCalendarEvents((prevCalendarEvents) => {
      const nextCalendarEvents = prevCalendarEvents.filter((event) => {
        return event.habit_id !== habitId;
      });

      return nextCalendarEvents;
    });
  };

  const clearCalendarEvents = () => {
    setCalendarEvents([]);
    setCalendarEventsByDate({});
  };

  const value = React.useMemo(
    () => ({
      addingCalendarEvent,
      fetchingCalendarEvents,
      calendarEventIdBeingDeleted,
      calendarEventsByDate,
      calendarEvents,
      addCalendarEvent,
      removeCalendarEvent,
      removeCalendarEventsByHabitId,
    }),
    [
      addingCalendarEvent,
      fetchingCalendarEvents,
      calendarEventsByDate,
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
