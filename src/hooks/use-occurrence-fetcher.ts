import { Toast } from '@heroui/react';
import pluralize from 'pluralize';
import React from 'react';

import {
  StorageBuckets,
  type DistributiveOmit,
  type OccurrenceFormValues,
  type OccurrenceSaveSubmission,
} from '@models';
import { uploadImages } from '@services';
import { getSupabaseBrowserClient, toOccurrenceValuesSubmission } from '@utils';

import useActionFetcher from './use-action-fetcher';
import useUser from './use-user';

type OccurrenceSaveTarget = DistributiveOmit<
  OccurrenceSaveSubmission,
  'photoPaths' | 'values'
>;

/**
 * Saves an occurrence through `/resources/occurrences`. Photos upload from the browser first,
 * because server functions only accept small request bodies, and the action receives their paths.
 */
const useOccurrenceFetcher = (onSuccess: () => void) => {
  const user = useUser();
  const fetcher = useActionFetcher(onSuccess);
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
          action: '/resources/occurrences',
          encType: 'application/json',
          method: 'post',
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  return { isSaving, save };
};

export default useOccurrenceFetcher;
