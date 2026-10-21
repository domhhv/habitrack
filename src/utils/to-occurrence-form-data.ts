import type { OccurrenceFormValues } from '@models';

import pickDefinedValues from './pick-defined-values';

const toOccurrenceFormData = (
  { metricValues, uploadedFiles, ...values }: OccurrenceFormValues,
  fields: Record<string, string>
) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([name, value]) => {
    formData.set(name, value);
  });
  formData.set(
    'values',
    JSON.stringify({ ...values, metricValues: pickDefinedValues(metricValues) })
  );
  uploadedFiles.forEach((file) => {
    formData.append('photos', file);
  });

  return formData;
};

export default toOccurrenceFormData;
