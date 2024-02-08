import { AddHabitDialogButton, ViewAllHabitsModalButton } from '@components';
import { AuthModalButton } from '@components';
import React from 'react';

import ThemeToggle from './ThemeToggle';
import {
  StyledAppHeader,
  StyledAppHeaderContent,
  StyledButtonsContainer,
} from './styled';

const Header = () => {
  return (
    <StyledAppHeader>
      <StyledAppHeaderContent>
        <StyledButtonsContainer>
          <AddHabitDialogButton />
          <ViewAllHabitsModalButton />
          <ThemeToggle />
        </StyledButtonsContainer>
        <AuthModalButton />
      </StyledAppHeaderContent>
    </StyledAppHeader>
  );
};

export default Header;
