import { useColorScheme } from '@mui/joy';
import React from 'react';

export const USER_THEME_STORAGE_KEY = 'user-theme-preference';

export enum ThemeModes {
  LIGHT = 'light',
  DARK = 'dark',
}

const useTheme = () => {
  const { setMode } = useColorScheme();
  const [theme, setTheme] = React.useState<ThemeModes>(ThemeModes.LIGHT);

  const darkThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  React.useEffect(() => {
    const userTheme = localStorage.getItem(
      USER_THEME_STORAGE_KEY
    ) as ThemeModes | null;

    if (userTheme) {
      setTheme(userTheme);
    } else {
      setTheme(
        darkThemeMediaQuery.matches ? ThemeModes.DARK : ThemeModes.LIGHT
      );
    }
  }, [darkThemeMediaQuery.matches]);

  React.useEffect(() => {
    if (theme) {
      setMode(theme);
      localStorage.setItem(USER_THEME_STORAGE_KEY, theme);
    }
  }, [theme, setMode]);

  darkThemeMediaQuery.addEventListener('change', (mediaQueryListEvent) => {
    setTheme(mediaQueryListEvent.matches ? ThemeModes.DARK : ThemeModes.LIGHT);
  });

  return {
    theme,
  };
};

export default useTheme;
