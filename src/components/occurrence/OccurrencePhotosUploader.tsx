import { Input, Button } from '@heroui/react';
import { TrashSimpleIcon } from '@phosphor-icons/react';
import React from 'react';

import { MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '@const';
import { StorageBuckets } from '@models';

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

  React.useEffect(() => {
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach((file) => {
        return dataTransfer.items.add(file);
      });
      fileInputRef.current.files = dataTransfer.files;
    }
  }, [files]);

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

    onFilesChange(files.concat(newFiles));
  };

  const allowedTypes = ALLOWED_IMAGE_TYPES[StorageBuckets.OCCURRENCE_PHOTOS];

  return (
    <div className="w-full space-y-2">
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
    </div>
  );
};

export default React.memo(OccurrencePhotosUploader);
