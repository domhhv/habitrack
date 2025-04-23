import { Input, addToast } from '@heroui/react';
import pluralize from 'pluralize';
import React from 'react';

import { MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@const';
import { useUser } from '@hooks';
import type {
  SignedUrls,
  FailedUpload,
  UploadResult,
  SuccessfulUpload,
} from '@models';
import { StorageBuckets } from '@models';
import { deleteFile, uploadImage, createSignedUrls } from '@services';
import { isRejected, isFulfilled, getErrorMessage } from '@utils';

import ImageCarousel from './ImageCarousel';

const isSuccessfulUpload = (
  input: PromiseFulfilledResult<UploadResult>
): input is PromiseFulfilledResult<SuccessfulUpload> => {
  return input.value.status === 'success';
};

const isFailedUpload = (
  input: PromiseFulfilledResult<UploadResult>
): input is PromiseFulfilledResult<FailedUpload> => {
  return input.value.status === 'error';
};

type OccurrencePhotosUploaderProps = {
  onPhotoPathsChange: React.Dispatch<React.SetStateAction<string[] | null>>;
  photoPaths: string[] | null;
};

const OccurrencePhotosUploader = ({
  onPhotoPathsChange,
  photoPaths,
}: OccurrencePhotosUploaderProps) => {
  const { user } = useUser();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [signedImageUrls, setSignedImageUrls] = React.useState<SignedUrls>([]);

  React.useEffect(() => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => {
        return dataTransfer.items.add(file);
      });
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [files]);

  React.useEffect(() => {
    const loadSignedUrls = async () => {
      if (!photoPaths || photoPaths.length === 0) {
        setSignedImageUrls([]);

        return;
      }

      try {
        const signedUrls = await createSignedUrls(photoPaths);

        setSignedImageUrls(signedUrls);
      } catch (error) {
        addToast({
          color: 'danger',
          description: `Error details: ${getErrorMessage(error)}`,
          title:
            'Something went wrong while loading photo previews. Please try reloading the page.',
        });
      }
    };

    void loadSignedUrls();
  }, [photoPaths]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    setFiles(files);

    const uploadRequests = files.map((file) => {
      return uploadImage(
        StorageBuckets.OCCURRENCE_PHOTOS,
        file,
        user?.id || ''
      );
    });

    const results = await Promise.allSettled(uploadRequests);
    const successfulUploadResults = results.filter(isFulfilled);
    const failedUploadResults = results.filter(isRejected);

    const successfulUploadPaths = successfulUploadResults
      .filter(isSuccessfulUpload)
      .map((result) => {
        return result.value.path;
      });

    const failedUploadReasons = failedUploadResults.map((result) => {
      return result.reason;
    });

    const failedUploadErrors = successfulUploadResults
      .filter(isFailedUpload)
      .map((result) => {
        return result.value.error;
      })
      .concat(failedUploadReasons);

    onPhotoPathsChange((prev) => {
      return [...(prev || []), ...successfulUploadPaths];
    });

    if (failedUploadErrors.length) {
      addToast({
        color: 'danger',
        description: `Error details: ${failedUploadErrors.join(', ')}`,
        title: `Failed to upload ${pluralize('photo', failedUploadErrors.length, true)}`,
      });
    }

    if (successfulUploadPaths.length) {
      addToast({
        color: 'success',
        title: `Successfully uploaded ${pluralize('photo', successfulUploadPaths.length, true)}`,
      });
    }
  };

  const handleDelete = async (index: number) => {
    const success = await deleteFile(
      StorageBuckets.OCCURRENCE_PHOTOS,
      photoPaths?.[index] || ''
    );

    if (!success) {
      return addToast({
        color: 'danger',
        title: 'Failed to delete photo',
      });
    }

    addToast({
      color: 'success',
      title: 'Successfully deleted photo',
    });

    onPhotoPathsChange((prev) => {
      if (!prev) {
        return [];
      }

      return prev.filter((_, i) => {
        return i !== index;
      });
    });

    setFiles((prev) => {
      if (!prev) {
        return [];
      }

      return prev.filter((_, i) => {
        return i !== index;
      });
    });
  };

  const allowedTypes = ALLOWED_IMAGE_TYPES[StorageBuckets.OCCURRENCE_PHOTOS];

  return (
    <div className="space-y-2">
      <Input
        multiple
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedTypes.join(',')}
        label={photoPaths?.length ? 'Add more photos' : 'Add photos'}
        description={`Supported formats: ${allowedTypes
          .map((type) => {
            return type.split('/')[1];
          })
          .join(
            ', '
          )}. Max size: ${MAX_FILE_SIZE_MB[StorageBuckets.OCCURRENCE_PHOTOS]}MB`}
      />

      {signedImageUrls.length > 0 && (
        <>
          <p className="text-sm text-gray-500">
            You can add more photos or delete existing ones
          </p>
          <ImageCarousel onDelete={handleDelete} imageUrls={signedImageUrls} />
        </>
      )}
    </div>
  );
};

export default React.memo(OccurrencePhotosUploader);
