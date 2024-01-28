import { AddHabitDialogButton, ViewAllHabitsModalButton } from '@components';
import { useHabits } from '@context';
import React from 'react';

import AuthModalButton from '../user/AuthModalButton';

import {
  StyledAppHeader,
  StyledAppHeaderContent,
  StyledButtonsContainer,
} from './styled';

const Header = () => {
  const { fetchingHabits } = useHabits();

  return (
    <StyledAppHeader>
      <StyledAppHeaderContent>
        <StyledButtonsContainer>
          <AddHabitDialogButton disabled={fetchingHabits} />
          <ViewAllHabitsModalButton loading={fetchingHabits} />
        </StyledButtonsContainer>
        <AuthModalButton />
      </StyledAppHeaderContent>
    </StyledAppHeader>
  );
};

export default Header;
