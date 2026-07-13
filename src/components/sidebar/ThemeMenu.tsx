import { Label, Dropdown } from '@heroui/react';
import {
  MoonIcon,
  CheckIcon,
  SunDimIcon,
  DesktopIcon,
} from '@phosphor-icons/react';

import { CustomButton } from '@components';
import { ThemeModes } from '@const';
import { useThemeMode } from '@hooks';

const MODE_ICONS = {
  [ThemeModes.DARK]: MoonIcon,
  [ThemeModes.LIGHT]: SunDimIcon,
  [ThemeModes.SYSTEM]: DesktopIcon,
};

const MODE_LABELS = {
  [ThemeModes.DARK]: 'Dark',
  [ThemeModes.LIGHT]: 'Light',
  [ThemeModes.SYSTEM]: 'System',
};

const ThemeMenu = () => {
  const { setThemeMode, themeMode } = useThemeMode();
  const CurrentIcon = MODE_ICONS[themeMode];

  return (
    <Dropdown>
      <CustomButton size="sm" isIconOnly variant="ghost" aria-label="Theme">
        <CurrentIcon size={16} />
      </CustomButton>
      <Dropdown.Popover className="min-w-[150px]">
        <Dropdown.Menu aria-label="Theme">
          {Object.values(ThemeModes).map((mode) => {
            const ModeIcon = MODE_ICONS[mode];

            return (
              <Dropdown.Item
                id={mode}
                key={mode}
                className="justify-between"
                textValue={MODE_LABELS[mode]}
                onAction={() => {
                  setThemeMode(mode);
                }}
              >
                <div className="flex items-center gap-2">
                  <ModeIcon className="size-4 shrink-0" />
                  <Label>{MODE_LABELS[mode]}</Label>
                </div>
                {themeMode === mode && (
                  <CheckIcon className="text-accent size-4 shrink-0" />
                )}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};

export default ThemeMenu;
