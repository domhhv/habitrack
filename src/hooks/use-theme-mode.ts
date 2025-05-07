import React from 'react';

import { ThemeModes } from '@const';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

const useThemeMode = () => {
  const [themeMode, setThemeMode] = React.useState<ThemeModes>(() => {
    return localStorage.theme || 'system';
  });

  const applyTheme = (mode: ThemeModes) => {
    const isSystemDark = window.matchMedia(MEDIA_QUERY).matches;

    document.documentElement.classList.toggle(
      'dark',
      mode === 'dark' || (mode === 'system' && isSystemDark)
    );
  };

  React.useEffect(() => {
    localStorage.theme = themeMode;
    applyTheme(themeMode);
    const mediaQueryList = window.matchMedia(MEDIA_QUERY);

    const handleMediaQueryListChange = (e: MediaQueryListEvent) => {
      if (themeMode === ThemeModes.SYSTEM) {
        applyTheme(e.matches ? ThemeModes.DARK : ThemeModes.LIGHT);
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
