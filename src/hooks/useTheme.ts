import { useColorScheme } from '@mui/joy';
import React from 'react';

export const USER_THEME_STORAGE_KEY = 'user-account-theme-preference';

export enum ThemeModes {
  LIGHT = 'light',
  DARK = 'dark',
}

const useTheme = () => {
  const { setMode } = useColorScheme();
  const [theme, setTheme] = React.useState<ThemeModes>();

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === ThemeModes.LIGHT ? ThemeModes.DARK : ThemeModes.LIGHT
    );
  };

  React.useEffect(() => {
    const darkThemeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

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

    const eventListener = (mediaQueryListEvent: MediaQueryListEvent) => {
      setTheme(
        mediaQueryListEvent.matches ? ThemeModes.DARK : ThemeModes.LIGHT
      );
    };

    darkThemeMediaQuery.addEventListener('change', eventListener);

    return () => {
      darkThemeMediaQuery.removeEventListener('change', eventListener);
    };
  }, []);

  React.useEffect(() => {
    if (theme) {
      setMode(theme);
      localStorage.setItem(USER_THEME_STORAGE_KEY, theme);
    }
  }, [theme, setMode]);

  return {
    theme,
    toggleTheme,
  };
};

export default useTheme;
