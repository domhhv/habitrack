import {
  CalendarEvent,
  useCalendarEvents,
  useSnackbar,
  useUser,
} from '@context';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { ChipDelete, CircularProgress, Typography } from '@mui/joy';
import { calendarService } from '@services';
import React from 'react';

import {
  StyledCalendarDayCellButton,
  StyledCalendarDayCellButtonHeader,
  StyledCalendarDayCellButtonIconsContainer,
  StyledHabitChip,
} from './styled';

type CalendarCellProps = {
  dateNumber: number;
  monthIndex: number;
  fullYear: number;
  onClick: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  events: CalendarEvent[];
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  rangeStatus: 'below-range' | 'in-range' | 'above-range';
};

const CalendarCell = ({
  dateNumber,
  monthIndex,
  fullYear,
  events,
  onNavigateBack,
  onNavigateForward,
  onClick,
  rangeStatus,
}: CalendarCellProps) => {
  const { user } = useUser();
  const calendarEventsContext = useCalendarEvents();
  const [active, setActive] = React.useState(false);
  const [current, setCurrent] = React.useState(false);
  const [eventIdBeingDeleted, setEventIdBeingDeleted] = React.useState<
    number | null
  >(null);
  const { showSnackbar } = useSnackbar();

  React.useEffect(() => {
    const today = new Date();
    setActive(rangeStatus === 'in-range');
    setCurrent(
      today.getDate() === dateNumber &&
        today.getMonth() + 1 === monthIndex &&
        today.getFullYear() === fullYear
    );
  }, [dateNumber, monthIndex, fullYear, rangeStatus]);

  const handleClick = () => {
    if (!active) {
      if (rangeStatus === 'below-range') {
        return onNavigateBack?.();
      }

      if (rangeStatus === 'above-range') {
        return onNavigateForward?.();
      }

      return;
    }

    return onClick(dateNumber, monthIndex, fullYear);
  };

  const handleCalendarEventDelete = async (
    calendarEventId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => {
    clickEvent.stopPropagation();
    setEventIdBeingDeleted(calendarEventId);

    try {
      await calendarService.destroyCalendarEvent(calendarEventId, user);
      calendarEventsContext.removeCalendarEvent(calendarEventId);
      showSnackbar('Your habit entry has been deleted from the calendar.', {
        dismissible: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setEventIdBeingDeleted(null);
    }
  };

  return (
    <StyledCalendarDayCellButton
      data-active={active}
      data-prev-month={rangeStatus === 'below-range'}
      data-next-month={rangeStatus === 'above-range'}
      data-current={current}
      onClick={handleClick}
      disabled={calendarEventsContext.fetchingCalendarEvents}
    >
      <StyledCalendarDayCellButtonHeader>
        <Typography level="body-sm" fontWeight={current ? 900 : 400}>
          {dateNumber}
        </Typography>
        {current && (
          <Typography level="body-sm" fontWeight={900}>
            Today
          </Typography>
        )}
      </StyledCalendarDayCellButtonHeader>
      <StyledCalendarDayCellButtonIconsContainer>
        {events.map((event) => {
          const Icon = event.habit.trait === 'good' ? FmdGoodIcon : FmdBadIcon;

          const isBeingDeleted = eventIdBeingDeleted === event.id;

          const endDecorator = isBeingDeleted ? (
            <CircularProgress size="sm" />
          ) : (
            <ChipDelete
              color={event.habit.trait === 'good' ? 'success' : 'danger'}
              variant="soft"
              onClick={(clickEvent) =>
                handleCalendarEventDelete(event.id, clickEvent)
              }
            >
              <DeleteForeverIcon fontSize="small" />
            </ChipDelete>
          );

          return (
            <StyledHabitChip
              variant="soft"
              color={event.habit.trait === 'good' ? 'success' : 'danger'}
              key={event.id}
              startDecorator={<Icon fontSize="small" />}
              disabled={isBeingDeleted}
              endDecorator={endDecorator}
            >
              {event.habit.name}
            </StyledHabitChip>
          );
        })}
      </StyledCalendarDayCellButtonIconsContainer>
    </StyledCalendarDayCellButton>
  );
};

export default CalendarCell;
