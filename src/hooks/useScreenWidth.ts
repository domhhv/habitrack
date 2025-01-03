import { tailwindConfig } from '@helpers';
import React from 'react';

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

  const { md, lg } = tailwindConfig.theme.screens;

  const isMobile = screenWidth < Number(md.slice(0, -2));
  const isDesktop = screenWidth >= Number(lg.slice(0, -2));

  return { screenWidth, isMobile, isDesktop };
};

export default useScreenWidth;
