import {
  CheckCircleOutlined,
  ErrorOutlined,
  InfoOutlined,
  WarningOutlined,
  NotificationsOutlined,
} from '@mui/icons-material';
import { Alert, Button, styled, Typography } from '@mui/joy';
import { ColorPaletteProp } from '@mui/joy/styles/types/colorSystem';
import { VariantProp } from '@mui/joy/styles/types/variants';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

type SnackbarOptions = {
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

const StyledSnackbarsWrapper = styled('div')(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  zIndex: 9999,
}));

export default function SnackbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [snackbars, setSnackbars] = React.useState<
    { id: string; message: string; options: SnackbarOptions }[]
  >([]);

  const showSnackbar = (message: string, options: SnackbarOptions = {}) => {
    setSnackbars((prevSnackbars) => [
      ...prevSnackbars,
      { id: crypto.randomUUID(), message, options },
    ]);
  };

  const hideSnackbar = (id: string) => {
    setSnackbars((prevSnackbars) =>
      prevSnackbars.filter((snackbar) => snackbar.id !== id)
    );
  };

  const value = React.useMemo(() => ({ showSnackbar }), []);

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

  return (
    <SnackbarContext.Provider value={value}>
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
            <AnimatePresence key={id} mode="wait">
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 200 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert
                  key={id}
                  startDecorator={ICONS_BY_COLOR[options.color || 'neutral']}
                  color={color}
                  variant={variant}
                  endDecorator={endDecorator}
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
              </motion.div>
            </AnimatePresence>
          );
        })}
      </StyledSnackbarsWrapper>
    </SnackbarContext.Provider>
  );
}
