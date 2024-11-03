import { type AlertProps } from '@components';
import { type ReactNode } from 'react';
import { create } from 'zustand';

type SnackbarOptions = Omit<AlertProps, 'message'> & {
  action?: ReactNode;
  autoHideDuration?: number;
  dismissible?: boolean;
  dismissText?: string;
};

type Snackbar = {
  id: string;
  message: string;
  options: SnackbarOptions;
};

type SnackbarState = {
  snackbars: Snackbar[];
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
  hideSnackbar: (id: string) => void;
};

const useSnackbarsStore = create<SnackbarState>((set, getState) => ({
  snackbars: [],
  showSnackbar: (message, options = {}) => {
    const id = crypto.randomUUID?.() || +new Date();

    set((state) => ({
      snackbars: [...state.snackbars, { id, message, options }],
    }));

    setTimeout(() => {
      getState().hideSnackbar(id);
    }, options.autoHideDuration || 5000);
  },
  hideSnackbar: (id) => {
    set((state) => ({
      snackbars: state.snackbars.filter((snackbar) => snackbar.id !== id),
    }));
  },
}));

export default useSnackbarsStore;
