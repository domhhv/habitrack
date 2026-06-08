import React from 'react';

const useHasKeyboard = () => {
  const [hasKeyboard, setHasKeyboard] = React.useState(true);

  React.useEffect(() => {
    const detectKeyboard = () => {
      const canHover = window.matchMedia('(hover: hover)').matches;

      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

      setHasKeyboard(canHover && hasFinePointer);
    };

    detectKeyboard();

    window.addEventListener('resize', detectKeyboard);

    return () => {
      window.removeEventListener('resize', detectKeyboard);
    };
  }, []);

  return hasKeyboard;
};

export default useHasKeyboard;
