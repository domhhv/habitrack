import React from 'react';

const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = React.useState(() => {
    return window.screen.availWidth;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.screen.availWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = screenWidth < Number(768);
  const isDesktop = screenWidth >= Number(1024);
  const isTablet = !isMobile && !isDesktop;

  return { isDesktop, isMobile, isTablet, screenWidth };
};

export default useScreenWidth;
