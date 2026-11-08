import { data } from 'react-router';

import type { FieldErrors } from '@models';

/**
 * Returns a 400 result for a submission that failed validation and wrote nothing, so loaders don't
 * revalidate. The form shows each message next to its field.
 */
const failValidation = (fieldErrors: FieldErrors) => {
  return data(
    {
      error: 'Please check the highlighted fields',
      fieldErrors,
      ok: false as const,
    },
    { status: 400 }
  );
};

export default failValidation;
