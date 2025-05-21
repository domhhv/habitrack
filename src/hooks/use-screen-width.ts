import React from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '@root/tailwind.config';

const resolvedTailwindConfig = resolveConfig(tailwindConfig);

const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = React.useState(() => {
    return window.innerWidth;
  });

  React.useEffect(() => {
    const handleResize = (event: UIEvent) => {
      setScreenWidth((event.target as typeof window)?.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { lg, md } = resolvedTailwindConfig.theme.screens;

  const isMobile = screenWidth < Number(md.slice(0, -2));
  const isDesktop = screenWidth >= Number(lg.slice(0, -2));
  const isTablet = !isMobile && !isDesktop;

  return { isDesktop, isMobile, isTablet, screenWidth };
};

export default useScreenWidth;
