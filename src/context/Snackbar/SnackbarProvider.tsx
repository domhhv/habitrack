import type { SnackbarOptions, Snackbar } from '@context';
import { SnackbarContext } from '@context';
import {
  CheckCircleOutlined,
  ErrorOutlined,
  InfoOutlined,
  WarningOutlined,
  NotificationsOutlined,
} from '@mui/icons-material';
import { Alert, Button, Typography } from '@mui/joy';
import { type ColorPaletteProp } from '@mui/joy/styles/types/colorSystem';
import { type VariantProp } from '@mui/joy/styles/types/variants';
import React from 'react';

import { StyledSnackbarsWrapper } from './styled';

type SnackbarProviderProps = {
  children: React.ReactNode;
};

const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [snackbars, setSnackbars] = React.useState<Snackbar[]>([]);

  const showSnackbar = (message: string, options: SnackbarOptions = {}) => {
    setSnackbars((prevSnackbars) => [
      ...prevSnackbars,
      { id: crypto.randomUUID?.() || +new Date(), message, options },
    ]);
  };

  const hideSnackbar = (id: string) => {
    setSnackbars((prevSnackbars) =>
      prevSnackbars.filter((snackbar) => snackbar.id !== id)
    );
  };

  const ICONS_BY_COLOR: Record<ColorPaletteProp, React.ReactNode> = {
    success: <CheckCircleOutlined />,
    neutral: <InfoOutlined />,
    warning: <WarningOutlined />,
    danger: <ErrorOutlined />,
    primary: <NotificationsOutlined />,
  };

  const BUTTON_VARIANTS_BY_ALERT_VARIANT: Record<
    VariantProp,
    VariantProp | undefined
  > = {
    soft: 'soft',
    solid: 'soft',
    outlined: 'plain',
    plain: 'plain',
  };

  const providerValue = React.useMemo(() => ({ showSnackbar }), []);

  return (
    <SnackbarContext.Provider value={providerValue}>
      {children}
      <StyledSnackbarsWrapper>
        {snackbars.map(({ id, message, options }) => {
          const color = options.color || 'neutral';
          const variant = options.variant || 'soft';

          const endDecorator = options.dismissible ? (
            <Button
              onClick={() => hideSnackbar(id)}
              size="sm"
              variant={BUTTON_VARIANTS_BY_ALERT_VARIANT[variant]}
              color={color}
            >
              {options.dismissText || 'Dismiss'}
            </Button>
          ) : null;

          setTimeout(() => {
            hideSnackbar(id);
          }, options.autoHideDuration || 5000);

          return (
            <div key={id}>
              <Alert
                key={id}
                startDecorator={ICONS_BY_COLOR[options.color || 'neutral']}
                color={color}
                variant={variant}
                endDecorator={endDecorator}
                data-testid="snackbar"
              >
                <Typography
                  level="title-md"
                  sx={{ margin: 0, color: 'inherit' }}
                >
                  {message}
                </Typography>
                {options.description && (
                  <Typography
                    level="body-xs"
                    sx={{ margin: 0, color: 'inherit' }}
                  >
                    {options.description}
                  </Typography>
                )}
              </Alert>
            </div>
          );
        })}
      </StyledSnackbarsWrapper>
    </SnackbarContext.Provider>
  );
};

export default SnackbarProvider;
