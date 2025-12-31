import React from 'react';

const useHasKeyboard = () => {
  const [hasKeyboard, setHasKeyboard] = React.useState(true);

  React.useEffect(() => {
    const canHover = window.matchMedia('(hover: hover)').matches;

    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    setHasKeyboard(canHover && hasFinePointer);
  }, []);

  return hasKeyboard;
};

export default useHasKeyboard;
