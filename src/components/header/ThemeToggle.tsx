import { ButtonGroup, Button, cn } from '@heroui/react';
import { ThemeMode, useScreenWidth, useThemeMode } from '@hooks';
import {
  SunDim as SunIcon,
  Desktop as DesktopIcon,
  Moon as MoonIcon,
} from '@phosphor-icons/react';
import React from 'react';

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
        const iconClassName = cn(isSelected && 'text-white');
        const buttonClassName = cn(isSelected && 'bg-secondary-500');

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
              className={cn('dark:text-neutral-200', iconClassName)}
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
