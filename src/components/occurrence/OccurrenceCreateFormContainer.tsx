import { getLocalTimeZone } from '@internationalized/date';
import React from 'react';

import type { MetricValue, OccurrenceMetricValueInsert } from '@models';
import { StorageBuckets } from '@models';
import { uploadImages } from '@services';
import {
  useUser,
  useHabits,
  useNoteActions,
  useMetricsActions,
  useOccurrenceActions,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrenceFormView, {
  type OccurrenceFormValues,
} from './OccurrenceFormView';

const OccurrenceCreateFormContainer = () => {
  const timeZone = getLocalTimeZone();
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { dayToLog } = useOccurrenceDrawerState();
  const { user } = useUser();
  const habits = useHabits();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote } = useNoteActions();
  const { addOccurrence } = useOccurrenceActions();
  const { saveMetricValues } = useMetricsActions();

  const buildMetricInserts = (
    metricValues: Record<string, MetricValue | undefined>,
    occurrenceId: string,
    userId: string
  ): OccurrenceMetricValueInsert[] => {
    return Object.entries(metricValues)
      .filter(([, val]) => {
        return val !== undefined;
      })
      .map(([metricId, val]) => {
        return {
          habitMetricId: metricId,
          occurrenceId,
          userId,
          value: val as MetricValue,
        };
      });
  };

  const handleSubmit = async (values: OccurrenceFormValues) => {
    if (!user || !dayToLog) {
      return;
    }

    const {
      hasSpecificTime,
      metricValues,
      note,
      occurredAt,
      selectedHabitId,
      uploadedFiles,
    } = values;

    setIsSaving(true);

    const photoPaths = uploadedFiles.length
      ? await uploadImages(
          StorageBuckets.OCCURRENCE_PHOTOS,
          user.id,
          uploadedFiles,
          selectedHabitId
        )
      : null;

    const addPromise = async () => {
      const newOccurrence = await addOccurrence({
        habitId: selectedHabitId,
        hasSpecificTime,
        occurredAt,
        photoPaths,
        timeZone,
        userId: user.id,
      });

      if (note) {
        await addNote({
          content: note,
          occurrenceId: newOccurrence.id,
          userId: user.id,
        });
      }

      const metricInserts = buildMetricInserts(
        metricValues,
        newOccurrence.id,
        user.id
      );

      if (metricInserts.length > 0) {
        await saveMetricValues(metricInserts);
      }
    };

    void handleAsyncAction(addPromise(), 'add_occurrence', setIsSaving).then(
      closeOccurrenceDrawer
    );
  };

  if (!dayToLog) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      isSaving={isSaving}
      dayToLog={dayToLog}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
    />
  );
};

export default OccurrenceCreateFormContainer;
