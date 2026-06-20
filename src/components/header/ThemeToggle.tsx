import { cn, ButtonGroup } from '@heroui/react';
import { MoonIcon, SunDimIcon, DesktopIcon } from '@phosphor-icons/react';
import React from 'react';

import { CustomButton } from '@components';
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
    <ButtonGroup variant="outline" className="relative">
      {Object.values(ThemeModes).map((mode, index) => {
        const isSelected = themeMode === mode;
        const Icon = modesToIcons[mode];

        return (
          <>
            {index > 0 && (
              <ButtonGroup.Separator
                className={cn(
                  index === 1 && 'left-7.75',
                  index === 2 && 'left-15.75'
                )}
              />
            )}
            <CustomButton
              size="sm"
              key={mode}
              isIconOnly
              variant={'outline'}
              className={cn('size-8', isSelected && 'text-accent')}
              onPress={() => {
                setThemeMode(mode);
              }}
            >
              <Icon size={14} />
            </CustomButton>
          </>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
