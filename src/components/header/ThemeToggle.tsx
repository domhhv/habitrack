import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import NightlightRoundRoundedIcon from '@mui/icons-material/NightlightRoundRounded';
import { Button, useColorScheme } from '@mui/joy';
import React from 'react';

import { StyledToggleModeIconButton } from './styled';

const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();

  const handleToggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <StyledToggleModeIconButton onClick={handleToggleMode}>
        {mode === 'light' ? (
          <NightlightRoundRoundedIcon />
        ) : (
          <LightModeRoundedIcon />
        )}
      </StyledToggleModeIconButton>
      <Button variant="plain">Current theme: {mode}</Button>
    </>
  );
};

export default ThemeToggle;
