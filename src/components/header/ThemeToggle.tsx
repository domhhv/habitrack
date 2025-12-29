import { Button, ButtonGroup } from '@heroui/react';
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
        const Icon = modesToIcons[mode];

        return (
          <Button
            size="sm"
            key={mode}
            isIconOnly
            color="secondary"
            variant={isSelected ? 'flat' : 'light'}
            onPress={() => {
              setThemeMode(mode);
            }}
          >
            <Icon size={14} weight={isSelected ? 'bold' : 'regular'} />
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
