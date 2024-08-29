import { ThemeMode, useThemeMode } from '@hooks';
import { useColorScheme } from '@mui/joy';
import { ButtonGroup, Button } from '@nextui-org/react';
import {
  SunDim as SunIcon,
  Desktop as DesktopIcon,
  Moon as MoonIcon,
} from '@phosphor-icons/react';
import clsx from 'clsx';
import React from 'react';

const modesToIcons = {
  [ThemeMode.LIGHT]: (
    <SunIcon className="dark:text-neutral-200" weight="bold" />
  ),
  [ThemeMode.SYSTEM]: (
    <DesktopIcon className="dark:text-neutral-200" weight="bold" />
  ),
  [ThemeMode.DARK]: (
    <MoonIcon className="dark:text-neutral-200" weight="bold" />
  ),
};

const ThemeToggle = () => {
  const { setMode } = useColorScheme();
  const { themeMode, changeThemeMode } = useThemeMode();

  const handleThemeChange = (newThemeMode: ThemeMode) => () => {
    setMode(newThemeMode);
    changeThemeMode(newThemeMode);
  };

  return (
    <ButtonGroup size="sm">
      {Object.values(ThemeMode).map((mode) => {
        const className = clsx(
          themeMode === mode && 'bg-neutral-200 dark:bg-neutral-500'
        );

        return (
          <Button
            key={mode}
            className={className}
            onPress={handleThemeChange(mode)}
            isIconOnly
          >
            {modesToIcons[mode]}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
