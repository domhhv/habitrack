import { type AlertOptions, Alert } from '@components';
import { SnackbarContext, type Snackbar } from '@context';
import React, { type ReactNode } from 'react';

const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbars, setSnackbars] = React.useState<Snackbar[]>([]);

  const showSnackbar = React.useCallback(
    (message: string, options: AlertOptions = {}) => {
      const id = crypto.randomUUID?.() || +new Date();

      setSnackbars((prevSnackbars) => [
        ...prevSnackbars,
        { id, message, options },
      ]);
    },
    []
  );

  const hideSnackbar = (id: string) => {
    setSnackbars((prevSnackbars) =>
      prevSnackbars.filter((snackbar) => snackbar.id !== id)
    );
  };

  const providerValue = React.useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackbarContext.Provider value={providerValue}>
      {children}
      <div className="fixed bottom-2 left-2 z-[99] flex flex-col gap-2">
        {snackbars.map(({ id, message, options }) => {
          setTimeout(() => {
            hideSnackbar(id);
          }, options.autoHideDuration || 5000);

          return (
            <Alert
              key={id}
              message={message}
              {...options}
              onDismiss={() => hideSnackbar(id)}
              testId="snackbar"
            />
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
};

export default React.memo(SnackbarProvider);
