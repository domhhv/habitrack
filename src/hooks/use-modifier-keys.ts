/// <reference types="user-agent-data-types" />
import React from 'react';

const useModifierKeys = () => {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    const fallbackDetectMac = () => {
      setIsMac(/mac/i.test(navigator.userAgent));
    };

    const detectMac = async () => {
      if (navigator.userAgentData) {
        try {
          const { platform } =
            await navigator.userAgentData.getHighEntropyValues(['platform']);
          setIsMac(/mac/i.test(platform || ''));
        } catch {
          fallbackDetectMac();
        }
      } else {
        fallbackDetectMac();
      }
    };

    void detectMac();
  }, []);

  return {
    alt: isMac ? '⌥' : 'Alt',
    ctrl: isMac ? '⌃' : 'Ctrl',
    mod: isMac ? '⌘' : 'Ctrl',
    shift: '⇧',
  };
};

export default useModifierKeys;
