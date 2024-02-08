import { ThemeModes, useTheme } from '@hooks';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import NightlightRoundRoundedIcon from '@mui/icons-material/NightlightRoundRounded';
import React from 'react';

import { StyledToggleModeIconButton } from './styled';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <StyledToggleModeIconButton onClick={toggleTheme}>
        {theme === ThemeModes.LIGHT ? (
          <NightlightRoundRoundedIcon />
        ) : (
          <LightModeRoundedIcon />
        )}
      </StyledToggleModeIconButton>
    </>
  );
};

export default ThemeToggle;
