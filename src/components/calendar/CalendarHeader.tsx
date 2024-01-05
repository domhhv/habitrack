import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Typography, styled, IconButton } from '@mui/joy';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const StyledCalendarHeader = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  display: 'flex',
  border: '1px solid',
  borderRadius: theme.radius.sm,
  alignItems: 'center',
}));

const StyledCalendarActiveMonthContainer = styled('div')({
  width: 230,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const StyledCalendarNavigationContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  '&:first-of-type': {
    marginRight: theme.spacing(1),
  },
}));

type ButtonProps = {
  disabled: boolean;
  'aria-label': string;
};

type Props = {
  activeMonthLabel: string;
  activeYear: string;
  prevButtonProps: ButtonProps;
  nextButtonProps: ButtonProps;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
};

export default function CalendarHeader({
  activeMonthLabel,
  activeYear,
  prevButtonProps,
  nextButtonProps,
  onNavigateBack,
  onNavigateForward,
}: Props) {
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
            <Typography level="title-md" sx={{ margin: 0 }}>
              {activeMonthLabel} {activeYear}
            </Typography>
          </motion.div>
        </AnimatePresence>
        <StyledCalendarNavigationContainer>
          <StyledIconButton
            disabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
          >
            <NavigateBefore fontSize="small" />
          </StyledIconButton>
          <StyledIconButton
            disabled={nextButtonProps.disabled}
            aria-label={nextButtonProps['aria-label']}
            onClick={onNavigateForward}
          >
            <NavigateNext fontSize="small" />
          </StyledIconButton>
        </StyledCalendarNavigationContainer>
      </StyledCalendarActiveMonthContainer>
    </StyledCalendarHeader>
  );
}
