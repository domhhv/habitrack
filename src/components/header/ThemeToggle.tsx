import ComputerIcon from '@mui/icons-material/Computer';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import NightlightRoundRoundedIcon from '@mui/icons-material/NightlightRoundRounded';
import { IconButton, ToggleButtonGroup, useColorScheme } from '@mui/joy';
import React from 'react';

const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme();

  const handleThemeChange = (
    _: React.MouseEvent<HTMLElement>,
    newThemeMode: 'light' | 'system' | 'dark' | null
  ) => {
    if (newThemeMode) {
      setMode(newThemeMode);
    }
  };

  return (
    <ToggleButtonGroup
      variant="plain"
      value={mode}
      onChange={handleThemeChange}
    >
      <IconButton value="light" size="sm">
        <LightModeRoundedIcon />
      </IconButton>
      <IconButton value="system" size="sm">
        <ComputerIcon />
      </IconButton>
      <IconButton value="dark" size="sm">
        <NightlightRoundRoundedIcon />
      </IconButton>
    </ToggleButtonGroup>
  );
};

export default ThemeToggle;
