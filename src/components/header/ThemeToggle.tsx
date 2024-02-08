import { ThemeModes, useTheme } from '@hooks';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import NightlightRoundRoundedIcon from '@mui/icons-material/NightlightRoundRounded';
import { Button, useColorScheme } from '@mui/joy';
import React from 'react';

import { StyledToggleModeIconButton } from './styled';

const ThemeToggle = () => {
  useTheme();
  const { mode, setMode } = useColorScheme();

  const handleToggleMode = () => {
    setMode(mode === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT);
  };

  return (
    <>
      <StyledToggleModeIconButton onClick={handleToggleMode}>
        {mode === ThemeModes.LIGHT ? (
          <NightlightRoundRoundedIcon />
        ) : (
          <LightModeRoundedIcon />
        )}
      </StyledToggleModeIconButton>
    </>
  );
};

export default ThemeToggle;
