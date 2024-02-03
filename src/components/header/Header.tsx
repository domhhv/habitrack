import { AddHabitDialogButton, ViewAllHabitsModalButton } from '@components';
import { useHabits } from '@context';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import NightlightRoundRoundedIcon from '@mui/icons-material/NightlightRoundRounded';
import { Button, useColorScheme } from '@mui/joy';
import React from 'react';

import AuthModalButton from '../user/AuthModalButton';

import {
  StyledAppHeader,
  StyledAppHeaderContent,
  StyledButtonsContainer,
  StyledToggleModeIconButton,
} from './styled';

const Header = () => {
  const { fetchingHabits } = useHabits();
  const { mode, setMode } = useColorScheme();

  const handleToggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <StyledAppHeader>
      <StyledAppHeaderContent>
        <StyledButtonsContainer>
          <AddHabitDialogButton disabled={fetchingHabits} />
          <ViewAllHabitsModalButton loading={fetchingHabits} />
          <StyledToggleModeIconButton onClick={handleToggleMode}>
            {mode === 'light' ? (
              <NightlightRoundRoundedIcon />
            ) : (
              <LightModeRoundedIcon />
            )}
          </StyledToggleModeIconButton>
          <Button variant="plain">Current theme: {mode}</Button>
        </StyledButtonsContainer>
        <AuthModalButton />
      </StyledAppHeaderContent>
    </StyledAppHeader>
  );
};

export default Header;
