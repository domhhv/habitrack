import { Input, Button, addToast } from '@heroui/react';
import { TrashSimpleIcon } from '@phosphor-icons/react';
import React from 'react';

import { ImageCarousel } from '@components';
import { MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@const';
import type { SignedUrls } from '@models';
import { StorageBuckets } from '@models';
import { deleteFile, createSignedUrls } from '@services';
import { getErrorMessage } from '@utils';

type OccurrencePhotosUploaderProps = {
  files: File[];
  photoPaths: string[] | null;
  onFilesChange: (files: File[]) => void;
};

const OccurrencePhotosUploader = ({
  files,
  onFilesChange,
  photoPaths,
}: OccurrencePhotosUploaderProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
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
    const uploadedFiles = Array.from(e.target.files || []);

    if (!uploadedFiles.length) {
      return;
    }

    const newFiles = uploadedFiles.filter((file) => {
      return !files.some((f) => {
        return f.name === file.name;
      });
    });

    if (newFiles.length === 0) {
      return;
    }

    onFilesChange(newFiles);
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

    setSignedImageUrls((prev) => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);

      return newUrls;
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

      {files.map((file, index) => {
        return (
          <div
            key={file.name}
            className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800"
          >
            <p className="pl-1 text-sm text-gray-700 dark:text-gray-100">
              {file.name}
            </p>
            <Button
              size="sm"
              isIconOnly
              color="danger"
              variant="light"
              onPress={() => {
                const newFiles = [...files];
                newFiles.splice(index, 1);
                onFilesChange(newFiles);
              }}
            >
              <TrashSimpleIcon size={16} weight="bold" />
            </Button>
          </div>
        );
      })}

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
