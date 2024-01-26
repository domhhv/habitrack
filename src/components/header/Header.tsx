import { AddHabitDialogButton, ViewAllHabitsModalButton } from '@components';
import { useHabits } from '@context';
import { styled } from '@mui/joy/styles';
import React from 'react';

import AuthModalButton from '../user/AuthModalButton';

const StyledAppHeader = styled('header')({
  backgroundColor: '#d6d3d1',
  borderBottom: '1px solid #78716c',
});

const StyledAppHeaderContent = styled('div')(({ theme }) => ({
  width: 1050,
  maxWidth: '100%',
  padding: theme.spacing(1, 2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
}));

const StyledButtonsContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  '& > button:first-of-type': {
    marginRight: 10,
  },
}));

export default function Header() {
  const { fetchingHabits } = useHabits();

  return (
    <StyledAppHeader>
      <StyledAppHeaderContent>
        <StyledButtonsContainer>
          <AddHabitDialogButton disabled={fetchingHabits || fetchingHabits} />
          <ViewAllHabitsModalButton
            loading={fetchingHabits || fetchingHabits}
          />
        </StyledButtonsContainer>
        <AuthModalButton />
      </StyledAppHeaderContent>
    </StyledAppHeader>
  );
}
