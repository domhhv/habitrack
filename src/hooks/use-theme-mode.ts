import React from 'react';

export enum ThemeMode {
  LIGHT = 'light',
  SYSTEM = 'system',
  DARK = 'dark',
}

const useThemeMode = () => {
  const [themeMode, setThemeMode] = React.useState<ThemeMode>(() => {
    return localStorage.theme || 'system';
  });

  const applyTheme = (mode: ThemeMode) => {
    document.documentElement.classList.toggle(
      'dark',
      mode === 'dark' ||
        (mode === 'system' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  };

  React.useEffect(() => {
    localStorage.theme = themeMode;
    applyTheme(themeMode);
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaQueryListChange = (e: MediaQueryListEvent) => {
      if (themeMode === ThemeMode.SYSTEM) {
        applyTheme(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT);
      }
    };

    mediaQueryList.addEventListener('change', handleMediaQueryListChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleMediaQueryListChange);
    };
  }, [themeMode]);

  return { setThemeMode, themeMode };
};

export default useThemeMode;
