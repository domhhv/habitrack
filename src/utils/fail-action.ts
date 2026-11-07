import { data } from 'react-router';

import type { ActionToast } from '@models';

import getErrorMessage from './get-error-message';

/**
 * Returns a 400 result for an action that wrote nothing, with a toast titled `title` that the
 * submitting component shows.
 */
const failAction = (title: string, error: unknown) => {
  const errorMessage = getErrorMessage(error);
  const toast: ActionToast = {
    description: `Error details: ${errorMessage}`,
    title,
    variant: 'danger',
  };

  return data(
    { error: errorMessage, ok: false as const, toasts: [toast] },
    { status: 400 }
  );
};

export default failAction;
