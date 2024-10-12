import {
  SnackbarContext,
  type SnackbarOptions,
  type Snackbar,
  type ButtonColor,
} from '@context';
import { Button } from '@nextui-org/react';
import {
  BellRinging,
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
} from '@phosphor-icons/react';
import React, { type ReactNode } from 'react';

const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbars, setSnackbars] = React.useState<Snackbar[]>([]);

  const showSnackbar = (message: string, options: SnackbarOptions = {}) => {
    const id = crypto.randomUUID?.() || +new Date();

    setSnackbars((prevSnackbars) => [
      ...prevSnackbars,
      { id, message, options },
    ]);
  };

  const hideSnackbar = (id: string) => {
    setSnackbars((prevSnackbars) =>
      prevSnackbars.filter((snackbar) => snackbar.id !== id)
    );
  };

  const ICONS_BY_COLOR: Record<ButtonColor, React.ReactNode> = {
    secondary: null,
    default: <Info weight="bold" size={18} />,
    success: <CheckCircle weight="bold" size={18} />,
    warning: <Warning weight="bold" size={18} />,
    danger: <WarningCircle weight="bold" size={18} />,
    primary: <BellRinging weight="bold" size={18} />,
  };

  const providerValue = React.useMemo(() => ({ showSnackbar }), []);

  return (
    <SnackbarContext.Provider value={providerValue}>
      {children}
      <div className="fixed bottom-2 left-2 z-50 flex flex-col gap-2">
        {snackbars.map(({ id, message, options }) => {
          const color = options.color || 'default';

          const endDecorator = options.dismissible ? (
            <Button onClick={() => hideSnackbar(id)} size="sm" color={color}>
              {options.dismissText || 'Dismiss'}
            </Button>
          ) : null;

          setTimeout(() => {
            hideSnackbar(id);
          }, options.autoHideDuration || 5000);

          return (
            <div key={id}>
              <div
                key={id}
                className="flex items-center gap-4 rounded-md border border-neutral-300 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-black"
                data-testid="snackbar"
              >
                {ICONS_BY_COLOR[color]}
                <p>{message}</p>
                {options.description && <span>{options.description}</span>}
                {endDecorator}
              </div>
            </div>
          );
        })}
      </div>
    </SnackbarContext.Provider>
  );
};

export default React.memo(SnackbarProvider);
