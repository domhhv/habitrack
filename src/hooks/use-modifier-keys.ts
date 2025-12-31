import React from 'react';

const useModifierKeys = () => {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    setIsMac(/mac/i.test(navigator.platform));
  }, []);

  return {
    alt: isMac ? '⌥' : 'Alt',
    ctrl: isMac ? '⌃' : 'Ctrl',
    mod: isMac ? '⌘' : 'Ctrl',
    shift: '⇧',
  };
};

export default useModifierKeys;
