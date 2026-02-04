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
  useNotesByOccurrenceId,
  useOccurrenceDrawerState,
  useOccurrenceDrawerActions,
} from '@stores';
import { handleAsyncAction } from '@utils';

import OccurrenceFormView, {
  type OccurrenceFormValues,
} from './OccurrenceFormView';

const OccurrenceForm = () => {
  const timeZone = getLocalTimeZone();
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const { dayToLog, isOpen, occurrenceToEdit } = useOccurrenceDrawerState();
  const { user } = useUser();
  const habits = useHabits();
  const notes = useNotesByOccurrenceId();
  const [isSaving, setIsSaving] = React.useState(false);
  const { addNote, deleteNote, updateNote } = useNoteActions();
  const { addOccurrence, updateOccurrence } = useOccurrenceActions();
  const { saveMetricValues } = useMetricsActions();

  const occurrenceNote = React.useMemo(() => {
    return notes[occurrenceToEdit?.id || ''];
  }, [notes, occurrenceToEdit]);

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
    if (!user || !(dayToLog || occurrenceToEdit)) {
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

    if (occurrenceToEdit) {
      const updatePromise = async () => {
        const uploadedPhotoPaths = uploadedFiles.length
          ? await uploadImages(
              StorageBuckets.OCCURRENCE_PHOTOS,
              user.id,
              uploadedFiles,
              selectedHabitId
            )
          : [];

        const photoPaths = (occurrenceToEdit.photoPaths || []).concat(
          uploadedPhotoPaths
        );

        await updateOccurrence(occurrenceToEdit, {
          habitId: selectedHabitId,
          hasSpecificTime,
          occurredAt,
          photoPaths: photoPaths.length ? photoPaths : null,
          userId: user.id,
        });

        if (note) {
          if (occurrenceNote) {
            await updateNote(occurrenceNote.id, {
              content: note,
              occurrenceId: occurrenceToEdit.id,
            });
          } else {
            await addNote({
              content: note,
              occurrenceId: occurrenceToEdit.id,
              userId: user.id,
            });
          }
        } else if (occurrenceNote) {
          await deleteNote(occurrenceNote.id);
        }

        const metricInserts = buildMetricInserts(
          metricValues,
          occurrenceToEdit.id,
          user.id
        );

        if (metricInserts.length > 0) {
          await saveMetricValues(metricInserts);
        }
      };

      void handleAsyncAction(
        updatePromise(),
        'update_occurrence',
        setIsSaving
      ).then(closeOccurrenceDrawer);

      return;
    }

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

  const handlePhotoDelete = (path: string) => {
    if (!occurrenceToEdit?.photoPaths) {
      return;
    }

    void updateOccurrence(occurrenceToEdit, {
      photoPaths: occurrenceToEdit.photoPaths.filter((p) => {
        return p !== path;
      }),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      isSaving={isSaving}
      onSubmit={handleSubmit}
      dayToLog={dayToLog ?? null}
      onClose={closeOccurrenceDrawer}
      occurrenceNote={occurrenceNote}
      onPhotoDelete={handlePhotoDelete}
      occurrenceToEdit={occurrenceToEdit ?? null}
    />
  );
};

export default OccurrenceForm;
