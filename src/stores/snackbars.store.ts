import { type AlertOptions } from '@components';
import { create } from 'zustand';

type Snackbar = {
  id: string;
  message: string;
  options: AlertOptions;
};

type SnackbarState = {
  snackbars: Snackbar[];
  showSnackbar: (message: string, options?: AlertOptions) => void;
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
