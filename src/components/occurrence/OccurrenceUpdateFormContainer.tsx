import React from 'react';
import { useSubmit } from 'react-router';

import {
  useHabits,
  useCalendarData,
  useActionFetcher,
  useOccurrenceToEdit,
} from '@hooks';
import type { OccurrenceFormValues, OccurrenceSubmission } from '@models';
import { useOccurrenceDrawerActions } from '@stores';
import { toOccurrenceFormData } from '@utils';

import OccurrenceFormView from './OccurrenceFormView';

const OccurrenceUpdateFormContainer = () => {
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const liveOccurrence = useOccurrenceToEdit();
  const [occurrenceToEdit, setOccurrenceToEdit] =
    React.useState(liveOccurrence);
  const habits = useHabits();
  const { notesByOccurrenceId: notes } = useCalendarData();
  const fetcher = useActionFetcher(closeOccurrenceDrawer);
  const submit = useSubmit();

  if (liveOccurrence && liveOccurrence.id !== occurrenceToEdit?.id) {
    setOccurrenceToEdit(liveOccurrence);
  }

  const occurrenceNote = React.useMemo(() => {
    return notes[occurrenceToEdit?.id || ''];
  }, [notes, occurrenceToEdit]);

  const handleSubmit = (values: OccurrenceFormValues) => {
    if (!occurrenceToEdit) {
      return;
    }

    void fetcher.submit(
      toOccurrenceFormData(values, {
        intent: 'update',
        noteId: occurrenceNote?.id ?? '',
        occurrenceId: occurrenceToEdit.id,
      }),
      {
        action: '/resources/occurrences',
        encType: 'multipart/form-data',
        method: 'post',
      }
    );
  };

  const handlePhotoDelete = (photoPath: string) => {
    if (!occurrenceToEdit) {
      return;
    }

    void submit(
      {
        intent: 'remove-photo',
        occurrenceId: occurrenceToEdit.id,
        photoPath,
      } satisfies OccurrenceSubmission,
      {
        action: '/resources/occurrences',
        encType: 'application/json',
        fetcherKey: `remove-photo-${photoPath}`,
        method: 'post',
        navigate: false,
      }
    );
  };

  if (!occurrenceToEdit) {
    return null;
  }

  return (
    <OccurrenceFormView
      habits={habits}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
      occurrenceNote={occurrenceNote}
      onPhotoDelete={handlePhotoDelete}
      isSaving={fetcher.state !== 'idle'}
      occurrenceToEdit={occurrenceToEdit}
      photoPaths={liveOccurrence?.photoPaths ?? null}
    />
  );
};

export default OccurrenceUpdateFormContainer;
