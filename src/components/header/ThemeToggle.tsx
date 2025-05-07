import { cn, Button, ButtonGroup } from '@heroui/react';
import { Moon, SunDim, Desktop } from '@phosphor-icons/react';
import React from 'react';

import { ThemeModes } from '@const';
import { useThemeMode, useScreenWidth } from '@hooks';

const modesToIcons = {
  [ThemeModes.DARK]: Moon,
  [ThemeModes.LIGHT]: SunDim,
  [ThemeModes.SYSTEM]: Desktop,
};

const ThemeToggle = () => {
  const { setThemeMode, themeMode } = useThemeMode();
  const { isDesktop } = useScreenWidth();

  return (
    <ButtonGroup>
      {Object.values(ThemeModes).map((mode) => {
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
            size={isDesktop ? 'md' : 'sm'}
            onPress={() => {
              setThemeMode(mode);
            }}
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
