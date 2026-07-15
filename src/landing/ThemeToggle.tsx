import { MoonIcon, SunDimIcon, DesktopIcon } from '@phosphor-icons/react';
import React from 'react';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

const THEME_MODES = ['light', 'system', 'dark'] as const;

type ThemeMode = (typeof THEME_MODES)[number];

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

type ThemeToggleProps = {
  className?: string;
};

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  /*
   * Initialized to 'system' so the prerendered markup (no localStorage)
   * matches the first client render during hydration; the stored mode is
   * applied after mount.
   */
  const [themeMode, setThemeMode] = React.useState<ThemeMode>('system');

  React.useEffect(() => {
    setThemeMode(localStorage.theme || 'system');
  }, []);

  const handleSelect = (mode: ThemeMode) => {
    localStorage.theme = mode;
    setThemeMode(mode);

    const isSystemDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    document.documentElement.classList.toggle(
      'dark',
      mode === 'dark' || (mode === 'system' && isSystemDark)
    );
  };

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(MEDIA_QUERY);

    const handleMediaQueryListChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    };

    mediaQueryList.addEventListener('change', handleMediaQueryListChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleMediaQueryListChange);
    };
  }, [themeMode]);

  return (
    <div
      className={`flex items-center divide-x divide-(--border) rounded-(--field-radius) border border-(--border) bg-(--surface) ${className}`}
    >
      {THEME_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode];
        const isSelected = themeMode === mode;

        return (
          <button
            key={mode}
            type="button"
            aria-pressed={isSelected}
            aria-label={MODE_LABELS[mode]}
            onClick={() => {
              handleSelect(mode);
            }}
            className={`flex size-8 cursor-pointer items-center justify-center outline-offset-2 transition-colors first:rounded-l-(--field-radius) last:rounded-r-(--field-radius) hover:bg-(--surface-secondary) focus-visible:outline-2 focus-visible:outline-(--focus) ${
              isSelected ? 'text-(--accent)' : 'text-(--muted)'
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
