import React from 'react';

const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = React.useState(() => {
    return window.innerWidth;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
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
