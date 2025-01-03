import { ThemeMode, useScreenWidth, useThemeMode } from '@hooks';
import { ButtonGroup, Button } from '@nextui-org/react';
import {
  SunDim as SunIcon,
  Desktop as DesktopIcon,
  Moon as MoonIcon,
} from '@phosphor-icons/react';
import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

const modesToIcons = {
  [ThemeMode.LIGHT]: SunIcon,
  [ThemeMode.SYSTEM]: DesktopIcon,
  [ThemeMode.DARK]: MoonIcon,
};

const ThemeToggle = () => {
  const { themeMode, setThemeMode } = useThemeMode();
  const { screenWidth } = useScreenWidth();

  const handleThemeChange = (newThemeMode: ThemeMode) => () => {
    setThemeMode(newThemeMode);
  };

  return (
    <ButtonGroup>
      {Object.values(ThemeMode).map((mode) => {
        const isSelected = themeMode === mode;
        const iconClassName = clsx(isSelected && 'text-white');
        const buttonClassName = clsx(
          isSelected && 'bg-secondary-500 dark:bg-secondary-600'
        );

        const Icon = modesToIcons[mode];

        return (
          <Button
            key={mode}
            className={buttonClassName}
            onPress={handleThemeChange(mode)}
            isIconOnly
            variant="flat"
            color="secondary"
            size={screenWidth > 1024 ? 'md' : 'sm'}
          >
            <Icon
              className={twMerge('dark:text-neutral-200', iconClassName)}
              weight={isSelected ? 'bold' : 'regular'}
              size={16}
            />
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
