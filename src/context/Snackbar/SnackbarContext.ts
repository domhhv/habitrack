import { ColorPaletteProp } from '@mui/joy/styles/types/colorSystem';
import { VariantProp } from '@mui/joy/styles/types/variants';
import React from 'react';

export type SnackbarOptions = {
  variant?: VariantProp;
  color?: ColorPaletteProp;
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
