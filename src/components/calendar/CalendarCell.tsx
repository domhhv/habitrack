import { deleteCalendarEvent } from '@actions';
import { CalendarEvent, CalendarEventsContext } from '@context';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { Box, Chip, ChipDelete, CircularProgress, Typography } from '@mui/joy';
import { styled } from '@mui/joy/styles';
import React from 'react';

type Props = {
  dateNumber: number;
  monthIndex: number;
  fullYear: number;
  onClick: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  events: CalendarEvent[];
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  rangeStatus: 'below-range' | 'in-range' | 'above-range';
};

const StyledCalendarDayCellButton = styled('button')(() => ({
  background: 'none',
  display: 'flex',
  flexDirection: 'column',
  border: 'none',
  width: 150,
  height: 150,
  borderTop: '1px solid',
  borderLeft: '1px solid',
  padding: 0,
  '&:last-of-type': {
    borderRight: '1px solid',
  },
  '&[data-prev-month="true"]:not([disabled])': {
    cursor: 'w-resize',
  },
  '&[data-next-month="true"]:not([disabled])': {
    cursor: 'e-resize',
  },
  '&[data-prev-month="true"], &[data-next-month="true"]': {
    backgroundColor: 'white',
    '&:not([disabled]):hover': {
      backgroundColor: '#f5f5f4',
    },
  },
  '&[data-active="true"]': {
    backgroundColor: '#f5f5f4',
    '&:not([disabled])': {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#e7e5e4',
      },
    },
  },
  '&[data-current="true"]': {
    backgroundColor: '#e7e5e4',
    '&:not([disabled])': {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#d6d3d1',
      },
    },
  },
}));

const StyledCalendarDayCellButtonHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0.5),
  width: '100%',
  borderBottom: '1px solid',
  boxSizing: 'border-box',
}));

const StyledCalendarDayCellButtonIconsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.25, 0.5),
  textAlign: 'left',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(0.6),
}));

export default function CalendarCell({
  dateNumber,
  monthIndex,
  fullYear,
  events,
  onNavigateBack,
  onNavigateForward,
  onClick,
  rangeStatus,
}: Props) {
  const { removeCalendarEvent, fetchingCalendarEvents } = React.useContext(
    CalendarEventsContext
  );
  const [active, setActive] = React.useState(false);
  const [current, setCurrent] = React.useState(false);
  const [eventIdBeingDeleted, setEventIdBeingDeleted] = React.useState<
    number | null
  >(null);

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
      await deleteCalendarEvent(calendarEventId);
      removeCalendarEvent(calendarEventId);
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
      disabled={fetchingCalendarEvents}
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
          const Icon =
            event.habit.trait === 'good'
              ? DoneAllRoundedIcon
              : CheckRoundedIcon;

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
            <StyledChip
              variant="soft"
              color={event.habit.trait === 'good' ? 'success' : 'danger'}
              key={event.id}
              startDecorator={<Icon fontSize="small" />}
              disabled={isBeingDeleted}
              endDecorator={endDecorator}
            >
              {event.habit.name}
            </StyledChip>
          );
        })}
      </StyledCalendarDayCellButtonIconsContainer>
    </StyledCalendarDayCellButton>
  );
}
