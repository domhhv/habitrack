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

const resolveIsLightTheme = (mode: ThemeModes, isSystemDark: boolean) => {
  return (
    mode === ThemeModes.LIGHT || (mode === ThemeModes.SYSTEM && !isSystemDark)
  );
};

const applyDomTheme = (mode: ThemeModes, isSystemDark: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  document.documentElement.classList.toggle(
    'dark',
    mode === ThemeModes.DARK || (mode === ThemeModes.SYSTEM && isSystemDark)
  );
};

export const createThemeSlice: SliceCreator<keyof ThemeSlice> = (set) => {
  return {
    isLightTheme: true,
    themeMode: ThemeModes.SYSTEM,
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

        try {
          localStorage.setItem('theme', mode);
        } catch {
          return;
        }
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
