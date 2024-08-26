import { useHabits, useOccurrences, useTraits } from '@context';
import { NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Select, Option, Box, Button } from '@mui/joy';
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
  onNavigateToMonth: (month: number) => void;
  onNavigateToYear: (year: number) => void;
  onResetFocusedDate: () => void;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEARS = [
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
];

const CalendarHeader = ({
  activeMonthLabel,
  activeYear,
  prevButtonProps,
  nextButtonProps,
  onNavigateBack,
  onNavigateForward,
  onNavigateToMonth,
  onNavigateToYear,
  onResetFocusedDate,
}: CalendarHeaderProps) => {
  const { habits } = useHabits();
  const { allTraits } = useTraits();
  const { filteredBy, filterBy } = useOccurrences();

  const handleMonthSelect = (
    _: React.SyntheticEvent | null,
    newMonth: string | null
  ) => {
    if (newMonth) {
      onNavigateToMonth(MONTHS.indexOf(newMonth) + 1);
    }
  };

  const handleYearSelect = (
    _: React.SyntheticEvent | null,
    newYear: number | null
  ) => {
    if (newYear) {
      onNavigateToYear(newYear);
    }
  };

  return (
    <StyledCalendarHeader>
      <StyledCalendarActiveMonthContainer>
        <Box mr={2}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Select
              variant="soft"
              value={activeMonthLabel}
              onChange={handleMonthSelect}
              sx={{ minWidth: 132 }}
            >
              {MONTHS.map((month) => (
                <Option key={month} value={month} label={month}>
                  {month}
                </Option>
              ))}
            </Select>
            <Select
              variant="soft"
              value={Number(activeYear)}
              onChange={handleYearSelect}
            >
              {YEARS.map((year) => (
                <Option key={year} value={year} label={year.toString()}>
                  {year}
                </Option>
              ))}
            </Select>
          </div>
        </Box>
        <StyledCalendarNavigationContainer>
          <StyledNavigationIconButton
            disabled={prevButtonProps.disabled}
            aria-label={prevButtonProps['aria-label']}
            onClick={onNavigateBack}
            role="navigate-back"
          >
            <NavigateBefore fontSize="small" />
          </StyledNavigationIconButton>
          <Button variant="soft" color="neutral" onClick={onResetFocusedDate}>
            Today
          </Button>
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
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <Select
          variant="soft"
          renderValue={() => 'Filter by habits'}
          value={filteredBy.habitIds}
          onChange={(_, habitIds: number[]) => {
            filterBy({
              ...filteredBy,
              habitIds,
            });
          }}
          sx={{ minWidth: 132 }}
          multiple
        >
          {habits.map((habit) => (
            <Option key={habit.id} value={habit.id} label={habit.name}>
              {habit.name}
            </Option>
          ))}
        </Select>
        <Select
          variant="soft"
          renderValue={() => 'Filter by traits'}
          value={filteredBy.traitIds}
          onChange={(_, newTraits: (number | string)[]) => {
            filterBy({
              ...filteredBy,
              traitIds: newTraits,
            });
          }}
          sx={{ minWidth: 132 }}
          multiple
        >
          {allTraits.map((trait) => (
            <Option key={trait.id} value={trait.id} label={trait.label}>
              {trait.label}
            </Option>
          ))}
        </Select>
      </Box>
    </StyledCalendarHeader>
  );
};

export default CalendarHeader;
