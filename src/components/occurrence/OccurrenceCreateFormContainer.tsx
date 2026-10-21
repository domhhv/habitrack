import React from 'react';

import { useHabits, useActionFetcher } from '@hooks';
import type { OccurrenceFormValues } from '@models';
import { useOccurrenceDrawerState, useOccurrenceDrawerActions } from '@stores';
import { toOccurrenceFormData } from '@utils';

import OccurrenceFormView from './OccurrenceFormView';

const OccurrenceCreateFormContainer = () => {
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { dayToLog } = useOccurrenceDrawerState();
  const habits = useHabits();
  const fetcher = useActionFetcher(closeOccurrenceDrawer);

  const handleSubmit = (values: OccurrenceFormValues) => {
    void fetcher.submit(toOccurrenceFormData(values, { intent: 'create' }), {
      action: '/resources/occurrences',
      encType: 'multipart/form-data',
      method: 'post',
    });
  };

  if (!dayToLog) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      dayToLog={dayToLog}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
      isSaving={fetcher.state !== 'idle'}
    />
  );
};

export default OccurrenceCreateFormContainer;
