import React from 'react';
import { useSubmit } from 'react-router';

import { useHabits, useActionFetcher } from '@hooks';
import type { OccurrenceFormValues, OccurrenceSubmission } from '@models';
import {
  useOccurrenceToEdit,
  useNotesByOccurrenceId,
  useOccurrenceDrawerActions,
} from '@stores';
import { toOccurrenceFormData } from '@utils';

import OccurrenceFormView from './OccurrenceFormView';

const OccurrenceUpdateFormContainer = () => {
  const { closeOccurrenceDrawer } = useOccurrenceDrawerActions();
  const occurrenceToEdit = useOccurrenceToEdit();
  const habits = useHabits();
  const notes = useNotesByOccurrenceId();
  const fetcher = useActionFetcher(closeOccurrenceDrawer);
  const submit = useSubmit();

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
    />
  );
};

export default OccurrenceUpdateFormContainer;
