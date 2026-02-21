/// <reference types="user-agent-data-types" />
import React from 'react';

const useModifierKeys = () => {
  const [isMac, setIsMac] = React.useState(false);

  React.useEffect(() => {
    const fallbackDetectMac = () => {
      setIsMac(/mac/i.test(navigator.userAgent));
    };

    if (navigator.userAgentData) {
      navigator.userAgentData
        .getHighEntropyValues(['platform'])
        .then(({ platform }) => {
          if (platform !== undefined) {
            return setIsMac(/mac/i.test(platform));
          }

          return fallbackDetectMac();
        })
        .catch(fallbackDetectMac);

      return;
    }

    fallbackDetectMac();
  }, []);

  return {
    alt: isMac ? '⌥' : 'Alt',
    ctrl: isMac ? '⌃' : 'Ctrl',
    enter: '⏎',
    mod: isMac ? '⌘' : 'Ctrl',
    shift: '⇧',
  };
};

export default useModifierKeys;
