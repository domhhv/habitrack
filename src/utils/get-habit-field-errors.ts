import { HABIT_FIELD_LIMITS } from '@const';
import type { FieldErrors } from '@models';

import getFormText from './get-form-text';

/**
 * Validation messages for the habit text fields in the form. A submitted name must not be blank.
 */
const getHabitFieldErrors = (formData: FormData) => {
  const fieldErrors: FieldErrors = {};

  if (formData.has('name') && !getFormText(formData, 'name')) {
    fieldErrors.name = 'Give the habit a name';
  }

  for (const [field, limit] of Object.entries(HABIT_FIELD_LIMITS)) {
    if (!fieldErrors[field] && getFormText(formData, field).length > limit) {
      fieldErrors[field] = `Keep it to ${limit} characters`;
    }
  }

  return fieldErrors;
};

export default getHabitFieldErrors;
