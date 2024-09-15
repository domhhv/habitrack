import React from 'react';

export type ButtonColor =
  | 'default'
  | 'secondary'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export type SnackbarOptions = {
  color?: ButtonColor;
  autoHideDuration?: number;
  dismissible?: boolean;
  description?: string;
  dismissText?: string;
};

export const SnackbarContext = React.createContext({
  showSnackbar: (_: string, __: SnackbarOptions = {}) => {},
});

export const useSnackbar = () => {
  const context = React.useContext(SnackbarContext);

  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }

  return context;
};

export type Snackbar = {
  id: string;
  message: string;
  options: SnackbarOptions;
};
