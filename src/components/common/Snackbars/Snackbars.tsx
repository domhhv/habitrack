import { Alert } from '@components';
import { Button } from '@nextui-org/react';
import { useSnackbarsStore } from '@stores';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

const Snackbars = () => {
  const { snackbars, hideSnackbar } = useSnackbarsStore();

  return (
    <div className="fixed bottom-2 left-2 z-[99] flex flex-col gap-2">
      <AnimatePresence mode="wait">
        {snackbars.map(({ id, message, options }) => {
          const {
            action,
            dismissible,
            dismissText = 'Dismiss',
            color,
          } = options;

          const dismissAction = dismissible && (
            <Button
              key={`${id}-dismiss`}
              onClick={() => hideSnackbar(id)}
              size="sm"
              color={color}
              variant="flat"
            >
              {dismissText}
            </Button>
          );

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: '-100%' }}
            >
              <Alert
                message={message}
                {...options}
                testId="snackbar"
                actions={[action, dismissAction]}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Snackbars;
