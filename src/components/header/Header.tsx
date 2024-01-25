import { AddHabitDialogButton, ViewAllHabitsModalButton } from '@components';
import { useHabits } from '@context';
import { styled } from '@mui/joy/styles';
import React from 'react';

import AuthModalButton from '../user/AuthModalButton';

const StyledAppHeader = styled('header')(({ theme }) => ({
  backgroundColor: '#d6d3d1',
  borderBottom: '1px solid #78716c',
  padding: theme.spacing(1, 0),
}));

const StyledButtonsContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  '& > button:first-of-type': {
    marginRight: 10,
  },
}));

const StyledAppHeaderContent = styled('div')(({ theme }) => ({
  width: 1050,
  padding: theme.spacing(0, 2),
  borderBox: 'border-box',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
  height: '100%',
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
