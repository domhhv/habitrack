import { cn, Button, ButtonGroup } from '@heroui/react';
import {
  Moon as MoonIcon,
  SunDim as SunIcon,
  Desktop as DesktopIcon,
} from '@phosphor-icons/react';
import React from 'react';

import { ThemeMode, useThemeMode, useScreenWidth } from '@hooks';

const modesToIcons = {
  [ThemeMode.DARK]: MoonIcon,
  [ThemeMode.LIGHT]: SunIcon,
  [ThemeMode.SYSTEM]: DesktopIcon,
};

const ThemeToggle = () => {
  const { setThemeMode, themeMode } = useThemeMode();
  const { screenWidth } = useScreenWidth();

  const handleThemeChange = (newThemeMode: ThemeMode) => {
    return () => {
      setThemeMode(newThemeMode);
    };
  };

  return (
    <ButtonGroup>
      {Object.values(ThemeMode).map((mode) => {
        const isSelected = themeMode === mode;
        const iconClassName = cn(isSelected && 'text-white');
        const buttonClassName = cn(isSelected && 'bg-secondary-500');

        const Icon = modesToIcons[mode];

        return (
          <Button
            key={mode}
            isIconOnly
            variant="flat"
            color="secondary"
            className={buttonClassName}
            onPress={handleThemeChange(mode)}
            size={screenWidth > 1024 ? 'md' : 'sm'}
          >
            <Icon
              size={16}
              weight={isSelected ? 'bold' : 'regular'}
              className={cn('dark:text-neutral-200', iconClassName)}
            />
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
