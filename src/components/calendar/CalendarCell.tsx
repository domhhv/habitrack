import { CalendarEvent, useCalendarEvents, useHabits } from '@context';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import FmdGoodIcon from '@mui/icons-material/FmdGood';
import { ChipDelete, CircularProgress, Typography } from '@mui/joy';
import { useSession, useUser } from '@supabase/auth-helpers-react';
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
  const session = useSession();
  const user = useUser();
  const {
    removeCalendarEvent,
    fetchingCalendarEvents,
    calendarEventIdBeingDeleted,
  } = useCalendarEvents();
  const { habits } = useHabits();
  const [active, setActive] = React.useState(false);
  const [current, setCurrent] = React.useState(false);

  React.useEffect(() => {
    console.log({ session });
  }, [session]);

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
    void removeCalendarEvent(calendarEventId);
  };

  return (
    <StyledCalendarDayCellButton
      data-active={active}
      data-prev-month={rangeStatus === 'below-range'}
      data-next-month={rangeStatus === 'above-range'}
      data-current={current}
      onClick={handleClick}
      disabled={fetchingCalendarEvents || !user?.id}
    >
      <StyledCalendarDayCellButtonHeader>
        <Typography level="body-md" fontWeight={900}>
          {dateNumber}
        </Typography>
        {current && (
          <Typography level="body-md" fontWeight={900}>
            Today
          </Typography>
        )}
      </StyledCalendarDayCellButtonHeader>
      <StyledCalendarDayCellButtonIconsContainer>
        {events.map((event) => {
          const eventHabit = habits[event.habit_id] || {};
          const isGoodHabit = eventHabit.trait === 'good';
          const hasIcon = !!eventHabit.icon_path;

          const icon = hasIcon ? (
            <img
              src={`${process.env.SUPABASE_STORAGE_URL}/${user?.id}/${eventHabit.icon_path}`}
              alt={`${eventHabit.name} icon`}
              width={24}
              height={24}
            />
          ) : isGoodHabit ? (
            <FmdGoodIcon fontSize="small" />
          ) : (
            <FmdBadIcon fontSize="small" />
          );

          const isBeingDeleted = calendarEventIdBeingDeleted === event.id;

          const endDecorator = isBeingDeleted ? (
            <CircularProgress size="sm" />
          ) : (
            <ChipDelete
              variant="soft"
              color={isGoodHabit ? 'success' : 'danger'}
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
              color={isGoodHabit ? 'success' : 'danger'}
              key={event.id}
              startDecorator={icon}
              disabled={isBeingDeleted}
              endDecorator={endDecorator}
            >
              {eventHabit.name}
            </StyledHabitChip>
          );
        })}
      </StyledCalendarDayCellButtonIconsContainer>
    </StyledCalendarDayCellButton>
  );
};

export default CalendarCell;
