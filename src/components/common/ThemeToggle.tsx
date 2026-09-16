import { Button, ButtonGroup } from '@heroui/react';
import { MoonIcon, SunDimIcon, DesktopIcon } from '@phosphor-icons/react';
import React from 'react';

import { ThemeModes } from '@const';
import { useThemeMode, useThemeActions } from '@stores';

const THEME_MODES = [ThemeModes.LIGHT, ThemeModes.SYSTEM, ThemeModes.DARK];

const MODE_ICONS = {
  dark: MoonIcon,
  light: SunDimIcon,
  system: DesktopIcon,
};

const MODE_LABELS = {
  dark: 'Use dark theme',
  light: 'Use light theme',
  system: 'Use system theme',
};

const ThemeToggle = () => {
  const { themeMode } = useThemeMode();
  const { setThemeMode } = useThemeActions();

  return (
    <div className="max-[372px]:hidden">
      <ButtonGroup size="sm" variant="outline" className="rounded-3xl border">
        {THEME_MODES.map((mode, index) => {
          const Icon = MODE_ICONS[mode];
          const isSelected = themeMode === mode;

          return (
            <Button
              key={mode}
              type="button"
              aria-pressed={isSelected}
              aria-label={MODE_LABELS[mode]}
              variant={isSelected ? 'secondary' : 'tertiary'}
              onPress={() => {
                setThemeMode(mode);
              }}
            >
              {index > 0 && <ButtonGroup.Separator />}
              <Icon size={14} />
            </Button>
          );
        })}
      </ButtonGroup>
    </div>
  );
};

export default ThemeToggle;
