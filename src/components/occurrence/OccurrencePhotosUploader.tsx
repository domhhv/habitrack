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
      <div>
        <p className="text-sm font-medium">
          {photoPaths?.length ? 'Add more photos' : 'Add photos'}
        </p>
        <Input
          multiple
          fullWidth
          type="file"
          ref={fileInputRef}
          variant="secondary"
          onChange={handleFileChange}
          accept={allowedTypes.join(',')}
        />
        <p className="text-xs text-gray-500">
          {`Supported formats: ${allowedTypes
            .map((type) => {
              return type.split('/')[1];
            })
            .join(
              ', '
            )}. Max size: ${MAX_FILE_SIZE_MB[StorageBuckets.OCCURRENCE_PHOTOS]}MB`}
        </p>
      </div>

      {files.map((file, index) => {
        return (
          <div
            key={file.name}
            className="border-border bg-background flex items-center justify-between rounded-md border px-2 py-1"
          >
            <p className="text-foreground pr-2 text-sm">{file.name}</p>
            <Button
              size="sm"
              isIconOnly
              variant="danger-soft"
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
