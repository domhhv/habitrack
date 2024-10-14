import { ThemeMode, useThemeMode } from '@hooks';
import { ButtonGroup, Button } from '@nextui-org/react';
import {
  SunDim as SunIcon,
  Desktop as DesktopIcon,
  Moon as MoonIcon,
  type IconWeight,
} from '@phosphor-icons/react';
import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type IconProps = {
  cn: string;
  w: IconWeight;
};

const modesToIcons = {
  [ThemeMode.LIGHT]: ({ cn, w }: IconProps) => (
    <SunIcon
      className={twMerge('dark:text-neutral-200', cn)}
      weight={w}
      size={16}
    />
  ),
  [ThemeMode.SYSTEM]: ({ cn, w }: IconProps) => (
    <DesktopIcon
      className={twMerge('dark:text-neutral-200', cn)}
      weight={w}
      size={16}
    />
  ),
  [ThemeMode.DARK]: ({ cn, w }: IconProps) => (
    <MoonIcon
      className={twMerge('dark:text-neutral-200', cn)}
      weight={w}
      size={16}
    />
  ),
};

const ThemeToggle = () => {
  const { themeMode, changeThemeMode } = useThemeMode();

  const handleThemeChange = (newThemeMode: ThemeMode) => () => {
    changeThemeMode(newThemeMode);
  };

  return (
    <ButtonGroup>
      {Object.values(ThemeMode).map((mode) => {
        const isSelected = themeMode === mode;
        const buttonClassName = clsx(
          'bg-slate-100 dark:bg-slate-800',
          isSelected && 'bg-slate-400 dark:bg-slate-600'
        );

        const iconClassName = clsx(isSelected && 'text-white');

        const Icon = modesToIcons[mode];

        return (
          <Button
            key={mode}
            className={buttonClassName}
            onPress={handleThemeChange(mode)}
            isIconOnly
          >
            <Icon cn={iconClassName} w={isSelected ? 'bold' : 'regular'} />
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default ThemeToggle;
