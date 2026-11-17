import { Toast } from '@heroui/react';
import pluralize from 'pluralize';
import React from 'react';
import { href, useFetcher } from 'react-router';

import { OCCURRENCE_SAVE_FETCHER_KEY } from '@const';
import {
  StorageBuckets,
  type ActionResult,
  type DistributiveOmit,
  type OccurrenceFormValues,
  type OccurrenceSaveSubmission,
} from '@models';
import { uploadImages } from '@services';
import { getSupabaseBrowserClient, toOccurrenceValuesSubmission } from '@utils';

import useUser from './use-user';

type OccurrenceSaveTarget = DistributiveOmit<
  OccurrenceSaveSubmission,
  'photoPaths' | 'values'
>;

/**
 * Saves an occurrence through `/resources/occurrences`. Photos upload from the browser first,
 * because server functions only accept small request bodies, and the action receives their paths.
 * `onSubmitted` runs once the save is on its way, so the drawer can close while the calendar shows
 * the pending entry. `OccurrenceDrawer` shows the result's toasts.
 */
const useOccurrenceFetcher = (onSubmitted: () => void) => {
  const user = useUser();
  const fetcher = useFetcher<ActionResult>({
    key: OCCURRENCE_SAVE_FETCHER_KEY,
  });
  const [isUploading, setIsUploading] = React.useState(false);
  const isSaving = isUploading || fetcher.state !== 'idle';

  const save = async (
    values: OccurrenceFormValues,
    target: OccurrenceSaveTarget
  ) => {
    if (!user || isSaving) {
      return;
    }

    setIsUploading(true);

    try {
      const { failedUploadErrors, paths } =
        values.uploadedFiles.length > 0
          ? await uploadImages(
              getSupabaseBrowserClient(),
              StorageBuckets.OCCURRENCE_PHOTOS,
              user.id,
              values.uploadedFiles,
              values.selectedHabitId
            )
          : { failedUploadErrors: [], paths: [] };

      if (failedUploadErrors.length > 0) {
        Toast.toast.danger(
          `Failed to upload ${pluralize('photo', failedUploadErrors.length, true)}`,
          { description: `Error details: ${failedUploadErrors.join(', ')}` }
        );
      }

      void fetcher.submit(
        {
          ...target,
          photoPaths: paths,
          values: toOccurrenceValuesSubmission(values),
        } satisfies OccurrenceSaveSubmission,
        {
          action: href('/resources/occurrences'),
          encType: 'application/json',
          method: 'post',
        }
      );
      onSubmitted();
    } finally {
      setIsUploading(false);
    }
  };

  return { isSaving, save };
};

export default useOccurrenceFetcher;
