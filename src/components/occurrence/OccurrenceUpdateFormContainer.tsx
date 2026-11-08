import React from 'react';
import { href, useSubmit } from 'react-router';

import {
  useHabits,
  useCalendarData,
  useOccurrenceToEdit,
  useOccurrenceFetcher,
} from '@hooks';
import type { OccurrenceFormValues, OccurrenceSubmission } from '@models';
import { useOccurrenceDrawerActions } from '@stores';

import OccurrenceFormView from './OccurrenceFormView';

const OccurrenceUpdateFormContainer = () => {
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const liveOccurrence = useOccurrenceToEdit();
  const [occurrenceToEdit, setOccurrenceToEdit] =
    React.useState(liveOccurrence);
  const habits = useHabits();
  const { notesByOccurrenceId: notes } = useCalendarData();
  const { isSaving, save } = useOccurrenceFetcher(closeOccurrenceDrawer);
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

    void save(values, {
      intent: 'update',
      noteId: occurrenceNote?.id ?? null,
      occurrenceId: occurrenceToEdit.id,
    });
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
        action: href('/resources/occurrences'),
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
      isSaving={isSaving}
      onSubmit={handleSubmit}
      onClose={closeOccurrenceDrawer}
      occurrenceNote={occurrenceNote}
      onPhotoDelete={handlePhotoDelete}
      occurrenceToEdit={occurrenceToEdit}
      photoPaths={liveOccurrence?.photoPaths ?? null}
    />
  );
};

export default OccurrenceUpdateFormContainer;
