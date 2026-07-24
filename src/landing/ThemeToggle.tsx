import { Button, ButtonGroup } from '@heroui/react';
import { MoonIcon, SunDimIcon, DesktopIcon } from '@phosphor-icons/react';
import { useFetcher, useLoaderData } from 'react-router';

const THEME_MODES = ['light', 'system', 'dark'] as const;

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
  const fetcher = useFetcher();
  const { themeMode } = useLoaderData();

  const isSystemDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <fetcher.Form method="post" className="max-[372px]:hidden">
      <input
        type="hidden"
        name="isSystemDark"
        value={isSystemDark.toString()}
      />
      <ButtonGroup size="sm" variant="outline" className="rounded-3xl border">
        {THEME_MODES.map((mode, index) => {
          const Icon = MODE_ICONS[mode];
          const isSelected = themeMode === mode;

          return (
            <Button
              key={mode}
              value={mode}
              type="submit"
              name="themeMode"
              aria-pressed={isSelected}
              aria-label={MODE_LABELS[mode]}
              variant={isSelected ? 'secondary' : 'tertiary'}
            >
              {index > 0 && <ButtonGroup.Separator />}
              <Icon size={14} />
            </Button>
          );
        })}
      </ButtonGroup>
    </fetcher.Form>
  );
};

export default ThemeToggle;
