import React from 'react';

import { MEDIA_QUERY, useThemeActions } from '@stores';
import { initializeTheme } from '@utils';

const useInitializeTheme = () => {
  const { applyMediaQueryChange, setThemeMode } = useThemeActions();

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      applyMediaQueryChange(event.matches);
    };

    setThemeMode(initializeTheme());
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [setThemeMode, applyMediaQueryChange]);
};

export default useInitializeTheme;
