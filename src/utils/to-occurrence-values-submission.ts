import type { OccurrenceFormValues } from '@models';

import pickDefinedValues from './pick-defined-values';

const toOccurrenceValuesSubmission = ({
  metricValues,
  uploadedFiles,
  ...values
}: OccurrenceFormValues) => {
  return { ...values, metricValues: pickDefinedValues(metricValues) };
};

export default toOccurrenceValuesSubmission;
