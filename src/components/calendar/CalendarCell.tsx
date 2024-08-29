import { useOccurrences } from '@context';
import { useScreenSize } from '@hooks';
import { Typography } from '@mui/joy';
import { useUser } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';
import React from 'react';

import OccurrenceChip from './OccurrenceChip';
import {
  StyledCalendarDayCellDiv,
  StyledCalendarDayCellHeader,
  StyledCalendarDayCellButtonIconsContainer,
  StyledCalendarTodayIcon,
} from './styled';

type CalendarCellProps = {
  dateNumber: number;
  monthIndex: number;
  fullYear: number;
  onClick: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  rangeStatus: 'below-range' | 'in-range' | 'above-range';
};

const CalendarCell = ({
  dateNumber,
  monthIndex,
  fullYear,
  onNavigateBack,
  onNavigateForward,
  onClick,
  rangeStatus,
}: CalendarCellProps) => {
  const cellRef = React.useRef<HTMLDivElement>(null);
  const user = useUser();
  const { removeOccurrence, fetchingOccurrences } = useOccurrences();
  const today = new Date();
  const isToday =
    today.getDate() === dateNumber &&
    today.getMonth() + 1 === monthIndex &&
    today.getFullYear() === fullYear;
  const screenSize = useScreenSize();
  const { occurrencesByDate } = useOccurrences();
  const date = format(
    new Date(fullYear, monthIndex - 1, dateNumber),
    'yyyy-MM-dd'
  );
  const occurrences = occurrencesByDate[date] || [];

  const handleClick = React.useCallback(() => {
    if (fetchingOccurrences || !user?.id) {
      return null;
    }

    if (!isToday) {
      if (rangeStatus === 'below-range') {
        return onNavigateBack?.();
      }

      if (rangeStatus === 'above-range') {
        return onNavigateForward?.();
      }
    }

    return onClick(dateNumber, monthIndex, fullYear);
  }, [
    isToday,
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

    const enterHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleClick();
      }
    };

    cell.addEventListener('keydown', enterHandler);

    return () => {
      cell.removeEventListener('keydown', enterHandler);
    };
  }, [cellRef, handleClick]);

  const handleOccurrenceDelete = async (
    occurrenceId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => {
    clickEvent.stopPropagation();
    void removeOccurrence(occurrenceId);
  };

  const renderToday = () => {
    if (!isToday) {
      return null;
    }

    const isMobile = screenSize < 768;

    if (isMobile) {
      return <StyledCalendarTodayIcon />;
    }

    return (
      <Typography level="body-md" fontWeight={900}>
        Today
      </Typography>
    );
  };

  return (
    <StyledCalendarDayCellDiv
      ref={cellRef}
      data-is-within-active-month={rangeStatus === 'in-range'}
      data-is-within-prev-month={rangeStatus === 'below-range'}
      data-is-within-next-month={rangeStatus === 'above-range'}
      data-is-today={isToday}
      onClick={handleClick}
      tabIndex={0}
      role="button"
    >
      <StyledCalendarDayCellHeader>
        <Typography level="body-md" fontWeight={900}>
          {dateNumber}
        </Typography>
        {renderToday()}
      </StyledCalendarDayCellHeader>
      <StyledCalendarDayCellButtonIconsContainer>
        {occurrences.map((occurrence) => {
          return (
            <OccurrenceChip
              key={occurrence.id}
              occurrence={occurrence}
              onDelete={handleOccurrenceDelete}
            />
          );
        })}
      </StyledCalendarDayCellButtonIconsContainer>
    </StyledCalendarDayCellDiv>
  );
};

export default CalendarCell;
