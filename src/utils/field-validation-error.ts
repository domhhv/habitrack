import type { FieldErrors } from '@models';

/**
 * Thrown by action validation before anything is written. `runAction` and the settings action turn
 * it into a 400 result with `fieldErrors` for the form.
 */
export class FieldValidationError extends Error {
  fieldErrors: FieldErrors;

  constructor(fieldErrors: FieldErrors) {
    super('Please check the highlighted fields');
    this.name = 'FieldValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export const assertValidFields = (fieldErrors: FieldErrors) => {
  if (Object.keys(fieldErrors).length > 0) {
    throw new FieldValidationError(fieldErrors);
  }
};
