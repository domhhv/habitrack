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
          <React.Fragment key={mode}>
            {index > 0 && (
              <ButtonGroup.Separator
                className={cn(
                  index === 1 && 'left-8.75 md:left-7.75',
                  index === 2 && 'left-17.75 md:left-15.75'
                )}
              />
            )}
            <CustomButton
              size="sm"
              isIconOnly
              variant="outline"
              className={cn('md:size-8', isSelected && 'text-accent')}
              onPress={() => {
                setThemeMode(mode);
              }}
            >
              <Icon size={14} />
            </CustomButton>
          </React.Fragment>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
