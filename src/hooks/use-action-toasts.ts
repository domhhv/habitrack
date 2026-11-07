import { Toast } from '@heroui/react';
import React from 'react';

import type { ActionToast } from '@models';

/**
 * Shows the toasts of an action result once, when a new result arrives.
 */
const useActionToasts = (result?: { toasts?: ActionToast[] } | null) => {
  React.useEffect(() => {
    result?.toasts?.forEach(({ description, title, variant }) => {
      Toast.toast[variant](title, { description });
    });
  }, [result]);
};

export default useActionToasts;
