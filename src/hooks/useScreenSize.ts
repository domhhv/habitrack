'use client';

import { useEffect, useState } from 'react';

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') {
      return 0;
    }

    return window.innerWidth;
  });

  useEffect(() => {
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
