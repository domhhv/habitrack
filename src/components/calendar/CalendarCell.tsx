import { useOccurrences, useHabits, useTraits } from '@context';
import type { Occurrence } from '@models';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ChipDelete, CircularProgress, Tooltip, Typography } from '@mui/joy';
import { useUser } from '@supabase/auth-helpers-react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import {
  StyledCalendarDayCellDiv,
  StyledCalendarDayCellButtonHeader,
  StyledCalendarDayCellButtonIconsContainer,
  StyledHabitChip,
} from './styled';

type CalendarCellProps = {
  dateNumber: number;
  monthIndex: number;
  fullYear: number;
  onClick: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  events: Occurrence[];
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
  const user = useUser();
  const { removeOccurrence, fetchingOccurrences, occurrenceIdBeingDeleted } =
    useOccurrences();
  const { habitsMap } = useHabits();
  const [active, setActive] = React.useState(false);
  const [current, setCurrent] = React.useState(false);
  const cellRef = React.useRef<HTMLDivElement>(null);
  const { traitsMap } = useTraits();

  React.useEffect(() => {
    const today = new Date();
    setActive(rangeStatus === 'in-range');
    setCurrent(
      today.getDate() === dateNumber &&
        today.getMonth() + 1 === monthIndex &&
        today.getFullYear() === fullYear
    );
  }, [dateNumber, monthIndex, fullYear, rangeStatus]);

  const handleClick = React.useCallback(() => {
    if (fetchingOccurrences || !user?.id) {
      return null;
    }

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
  }, [
    active,
    dateNumber,
    fetchingOccurrences,
    fullYear,
    monthIndex,
    onClick,
    onNavigateBack,
    onNavigateForward,
    rangeStatus,
    user?.id,
  ]);

  React.useEffect(() => {
    const cell = cellRef.current;

    if (!cell) {
      return;
    }

    const clickHandler = (event: MouseEvent) => {
      if (event.target instanceof HTMLDivElement) {
        handleClick();
      }
    };

    cell.addEventListener('click', clickHandler);

    return () => {
      cell?.removeEventListener('click', clickHandler);
    };
  }, [cellRef, handleClick]);

  const handleCalendarEventDelete = async (
    calendarEventId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => {
    clickEvent.stopPropagation();
    void removeOccurrence(calendarEventId);
  };

  return (
    <StyledCalendarDayCellDiv
      ref={cellRef}
      data-active={active}
      data-prev-month={rangeStatus === 'below-range'}
      data-next-month={rangeStatus === 'above-range'}
      data-current={current}
      onClick={handleClick}
      role="button"
      tabIndex={0}
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
          const eventHabit = habitsMap[event.habitId!] || {};
          const isGoodHabit = traitsMap[eventHabit.traitId]?.slug === 'good';

          const isBeingDeleted = occurrenceIdBeingDeleted === event.id;

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
            <Tooltip title={eventHabit.name} key={event.id}>
              <StyledHabitChip
                variant="soft"
                color={isGoodHabit ? 'success' : 'danger'}
                key={event.id}
                startDecorator={
                  <img
                    src={getHabitIconUrl(eventHabit.iconPath)}
                    alt={`${eventHabit.name} icon`}
                    width={16}
                    height={16}
                  />
                }
                disabled={isBeingDeleted}
                endDecorator={endDecorator}
              />
            </Tooltip>
          );
        })}
      </StyledCalendarDayCellButtonIconsContainer>
    </StyledCalendarDayCellDiv>
  );
};

export default CalendarCell;
