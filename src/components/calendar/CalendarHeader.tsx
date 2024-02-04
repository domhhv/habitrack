import { useCalendarEvents } from '@context';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Typography } from '@mui/joy';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import {
  StyledCalendarActiveMonthContainer,
  StyledCalendarHeader,
  StyledCalendarNavigationContainer,
  StyledHeaderLoadingOverlay,
  StyledNavigationIconButton,
} from './styled';

type NavigationButtonProps = {
  disabled: boolean;
  'aria-label': string;
};

type CalendarHeaderProps = {
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
  const { fetchingCalendarEvents } = useCalendarEvents();

  return (
    <StyledCalendarHeader>
      <StyledCalendarActiveMonthContainer>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeMonthLabel}-${activeYear}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Typography level="title-lg" sx={{ margin: 0 }}>
              {activeMonthLabel} {activeYear}
            </Typography>
          </motion.div>
        </AnimatePresence>
        <StyledCalendarNavigationContainer>
          <StyledNavigationIconButton
            disabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
          >
            <NavigateBefore fontSize="small" />
          </StyledNavigationIconButton>
          <StyledNavigationIconButton
            disabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
          >
            <NavigateNext fontSize="small" />
          </StyledNavigationIconButton>
        </StyledCalendarNavigationContainer>
      </StyledCalendarActiveMonthContainer>

      {fetchingCalendarEvents && (
        <StyledHeaderLoadingOverlay>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Fetching calendar events, please wait...
          </motion.div>
        </StyledHeaderLoadingOverlay>
      )}
    </StyledCalendarHeader>
  );
};

export default CalendarHeader;
