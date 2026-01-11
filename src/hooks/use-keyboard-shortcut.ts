import React from 'react';

type Options = {
  enabled?: boolean;
  ignoreInputs?: boolean;
};

const useKeyboardShortcut = (
  key: string | string[],
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

      const keys = Array.isArray(key) ? key : [key];

      for (const k of keys) {
        if (event.key.toLowerCase() === k.toLowerCase()) {
          event.preventDefault();
          callbackRef.current();

          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, enabled, ignoreInputs]);
};

export default useKeyboardShortcut;
