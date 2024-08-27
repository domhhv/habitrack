import { ThemeMode, useThemeMode } from '@hooks';
import { useColorScheme } from '@mui/joy';
import {
  SunDim as SunIcon,
  Desktop as DesktopIcon,
  Moon as MoonIcon,
} from '@phosphor-icons/react';
import clsx from 'clsx';
import React from 'react';
import { Button } from 'react-aria-components';

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
    <div className="[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md">
      {Object.values(ThemeMode).map((mode) => {
        const className = clsx(
          'p-2 outline-none hover:bg-neutral-200 dark:hover:bg-neutral-700',
          themeMode === mode && 'bg-neutral-200 dark:bg-neutral-800'
        );
        return (
          <Button
            key={mode}
            className={className}
            onPress={handleThemeChange(mode)}
          >
            {modesToIcons[mode]}
          </Button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
