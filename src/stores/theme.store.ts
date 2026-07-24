import { useShallow } from 'zustand/react/shallow';

import { ThemeModes } from '@const';

import { useBoundStore, type SliceCreator } from './bound.store';

export const MEDIA_QUERY = '(prefers-color-scheme: dark)';

export type ThemeSlice = {
  isLightTheme: boolean;
  themeMode: ThemeModes;
  themeActions: {
    applyMediaQueryChange: (isSystemDark: boolean) => void;
    setThemeMode: (mode: ThemeModes) => void;
  };
};

const getInitialThemeMode = (): ThemeModes => {
  // return (localStorage.theme as ThemeModes) || ThemeModes.SYSTEM;
  return ThemeModes.SYSTEM;
};

const resolveIsLightTheme = (mode: ThemeModes, isSystemDark: boolean) => {
  return (
    mode === ThemeModes.LIGHT || (mode === ThemeModes.SYSTEM && !isSystemDark)
  );
};

const applyDomTheme = (mode: ThemeModes, isSystemDark: boolean) => {
  document.documentElement.classList.toggle(
    'dark',
    mode === ThemeModes.DARK || (mode === ThemeModes.SYSTEM && isSystemDark)
  );
};

export const createThemeSlice: SliceCreator<keyof ThemeSlice> = (set) => {
  const initialThemeMode = getInitialThemeMode();
  // const initialIsSystemDark = window.matchMedia(MEDIA_QUERY).matches;

  // applyDomTheme(initialThemeMode, initialIsSystemDark);

  return {
    // isLightTheme: resolveIsLightTheme(initialThemeMode, initialIsSystemDark),
    isLightTheme: true,
    themeMode: initialThemeMode,
    themeActions: {
      applyMediaQueryChange: (isSystemDark) => {
        set(
          (state) => {
            if (state.themeMode === ThemeModes.SYSTEM) {
              applyDomTheme(ThemeModes.SYSTEM, isSystemDark);
              state.isLightTheme = !isSystemDark;
            }
          },
          undefined,
          'themeActions.applyMediaQueryChange'
        );
      },
      setThemeMode: (mode) => {
        localStorage.theme = mode;

        const isSystemDark = window.matchMedia(MEDIA_QUERY).matches;

        applyDomTheme(mode, isSystemDark);

        set(
          (state) => {
            state.themeMode = mode;
            state.isLightTheme = resolveIsLightTheme(mode, isSystemDark);
          },
          undefined,
          'themeActions.setThemeMode'
        );
      },
    },
  };
};

export const useThemeMode = () => {
  return useBoundStore(
    useShallow((state) => {
      return {
        isLightTheme: state.isLightTheme,
        themeMode: state.themeMode,
      };
    })
  );
};

export const useThemeActions = () => {
  return useBoundStore((state) => {
    return state.themeActions;
  });
};
