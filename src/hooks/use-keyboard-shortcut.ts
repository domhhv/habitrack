import React from 'react';

type Options = {
  enabled?: boolean;
  ignoreInputs?: boolean;
};

const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  options: Options = {}
) => {
  const { enabled = true, ignoreInputs = true } = options;

  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (ignoreInputs) {
        const target = event.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const isEditable = target.isContentEditable;

        if (tagName === 'input' || tagName === 'textarea' || isEditable) {
          return;
        }
      }

      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, enabled, ignoreInputs]);
};

export default useKeyboardShortcut;
