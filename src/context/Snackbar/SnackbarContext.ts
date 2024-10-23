import { type AlertOptions } from '@components';
import React from 'react';

export type Snackbar = {
  id: string;
  message: string;
  options: AlertOptions;
};

type SnackbarContextType = {
  showSnackbar: (message: string, options?: AlertOptions) => void;
};

export const SnackbarContext = React.createContext<SnackbarContextType | null>(
  null
);

export const useSnackbar = () => {
  const context = React.useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }

  return context;
};
