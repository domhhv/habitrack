import React from 'react';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = React.useState(() => {
    return window.innerWidth;
  });

  React.useEffect(() => {
    const handleResize = (event: UIEvent) => {
      setScreenSize((event.target as typeof window)?.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return screenSize;
};

export default useScreenSize;
