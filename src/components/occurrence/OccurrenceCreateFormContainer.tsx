import React from 'react';

import { useHabits, useOccurrenceFetcher } from '@hooks';
import type { OccurrenceFormValues } from '@models';
import { useOccurrenceDrawerState, useOccurrenceDrawerActions } from '@stores';

import OccurrenceFormView from './OccurrenceFormView';

const OccurrenceCreateFormContainer = () => {
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { dayToLog } = useOccurrenceDrawerState();
  const habits = useHabits();
  const { isSaving, save } = useOccurrenceFetcher(closeOccurrenceDrawer);

  const handleSubmit = (values: OccurrenceFormValues) => {
    void save(values, { intent: 'create' });
  };

  if (!dayToLog) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      dayToLog={dayToLog}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
    />
  );
};

export default OccurrenceCreateFormContainer;
