import { CalendarEvent } from '@context';
import {
  LocalBar,
  OndemandVideo,
  Park,
  SmokingRooms,
} from '@mui/icons-material';
import { Box, Typography } from '@mui/joy';
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

const HabitIcons: Record<string, React.ElementType> = {
  tobacco: SmokingRooms,
  alcohol: LocalBar,
  weed: Park,
  porn: OndemandVideo,
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
  '&[data-prev-month="true"]': {
    cursor: 'w-resize',
  },
  '&[data-next-month="true"]': {
    cursor: 'e-resize',
  },
  '&[data-prev-month="true"], &[data-next-month="true"]': {
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: '#f5f5f4',
    },
  },
  '&[data-active="true"]': {
    cursor: 'pointer',
    backgroundColor: '#f5f5f4',
    '&:hover': {
      backgroundColor: '#e7e5e4',
    },
  },
  '&[data-current="true"]': {
    backgroundColor: '#e7e5e4',
    '&:hover': {
      backgroundColor: '#d6d3d1',
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
  const [active, setActive] = React.useState(false);
  const [current, setCurrent] = React.useState(false);

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

  return (
    <StyledCalendarDayCellButton
      data-active={active}
      data-prev-month={rangeStatus === 'below-range'}
      data-next-month={rangeStatus === 'above-range'}
      data-current={current}
      onClick={handleClick}
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
          const Icon = HabitIcons[event.habit.name];

          return (
            <Icon
              key={event.id}
              className="calendar-day-cell-habit-icon"
              color="primary"
            />
          );
        })}
      </StyledCalendarDayCellButtonIconsContainer>
    </StyledCalendarDayCellButton>
  );
}
