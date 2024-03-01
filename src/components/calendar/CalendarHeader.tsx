import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Typography } from '@mui/joy';
import React from 'react';

import {
  StyledCalendarActiveMonthContainer,
  StyledCalendarHeader,
  StyledCalendarNavigationContainer,
  StyledNavigationIconButton,
} from './styled';

type NavigationButtonProps = {
  disabled: boolean;
  'aria-label': string;
};

export type CalendarHeaderProps = {
  activeMonthLabel: string;
  activeYear: string;
  prevButtonProps: NavigationButtonProps;
  nextButtonProps: NavigationButtonProps;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
};

const CalendarHeader = ({
  activeMonthLabel,
  activeYear,
  prevButtonProps,
  nextButtonProps,
  onNavigateBack,
  onNavigateForward,
}: CalendarHeaderProps) => {
  return (
    <StyledCalendarHeader>
      <StyledCalendarActiveMonthContainer>
        <div>
          <Typography level="title-lg" sx={{ margin: 0 }}>
            {activeMonthLabel} {activeYear}
          </Typography>
        </div>
        <StyledCalendarNavigationContainer>
          <StyledNavigationIconButton
            disabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
            role="navigate-back"
          >
            <NavigateBefore fontSize="small" />
          </StyledNavigationIconButton>
          <StyledNavigationIconButton
            disabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
            role="navigate-forward"
          >
            <NavigateNext fontSize="small" />
          </StyledNavigationIconButton>
        </StyledCalendarNavigationContainer>
      </StyledCalendarActiveMonthContainer>
    </StyledCalendarHeader>
  );
};

export default CalendarHeader;
