import { cn, Button, ButtonGroup } from '@heroui/react';
import { MoonIcon, SunDimIcon, DesktopIcon } from '@phosphor-icons/react';
import React from 'react';

import { ThemeModes } from '@const';
import { useThemeMode } from '@hooks';

const modesToIcons = {
  [ThemeModes.DARK]: MoonIcon,
  [ThemeModes.LIGHT]: SunDimIcon,
  [ThemeModes.SYSTEM]: DesktopIcon,
};

const ThemeToggle = () => {
  const { setThemeMode, themeMode } = useThemeMode();

  return (
    <ButtonGroup>
      {Object.values(ThemeModes).map((mode) => {
        const isSelected = themeMode === mode;
        const iconClassName = cn(
          isSelected && 'text-secondary-700 dark:text-secondary-300'
        );
        const buttonClassName = cn(
          isSelected && 'bg-secondary-300 dark:bg-secondary-700'
        );

        const Icon = modesToIcons[mode];

        return (
          <Button
            size="sm"
            key={mode}
            isIconOnly
            variant="flat"
            color="secondary"
            className={buttonClassName}
            onPress={() => {
              setThemeMode(mode);
            }}
          >
            <Icon
              size={14}
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
