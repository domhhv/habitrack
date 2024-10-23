import { Alert } from '@components';
import { useSnackbarsStore } from '@stores';
import React from 'react';

const Snackbars = () => {
  const { snackbars, hideSnackbar } = useSnackbarsStore();

  return (
    <div className="fixed bottom-2 left-2 z-[99] flex flex-col gap-2">
      {snackbars.map(({ id, message, options }) => {
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
  );
};

export default Snackbars;
