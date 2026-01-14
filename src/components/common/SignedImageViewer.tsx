import { addToast } from '@heroui/react';
import React from 'react';

import type { SignedUrls, StorageBuckets } from '@models';
import { deleteFile, createSignedUrls } from '@services';
import { getErrorMessage } from '@utils';

import { ImageCarousel } from './index';

type SignedImageViewerProps = {
  bucket: StorageBuckets;
  paths: string[] | null;
  onDelete: (path: string) => void;
};

const SignedImageViewer = ({
  bucket,
  onDelete,
  paths,
}: SignedImageViewerProps) => {
  const [signedImageUrls, setSignedImageUrls] = React.useState<SignedUrls>([]);

  React.useEffect(() => {
    const loadSignedUrls = async () => {
      if (!paths?.length) {
        setSignedImageUrls([]);

        return;
      }

      try {
        const signedUrls = await createSignedUrls(paths);

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
  }, [paths]);

  const deleteImage = async (index: number) => {
    const path = paths?.[index];

    if (!path) {
      return;
    }

    try {
      await deleteFile(bucket, path);

      addToast({
        color: 'success',
        title: 'Successfully deleted photo',
      });

      setSignedImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls.splice(index, 1);

        return newUrls;
      });

      onDelete(path);
    } catch (error) {
      return addToast({
        color: 'danger',
        description: `Error details: ${getErrorMessage(error)}`,
        title: 'Failed to delete photo',
      });
    }
  };

  return (
    signedImageUrls.length > 0 && (
      <>
        <p className="text-sm text-gray-500">
          You can add more photos or delete existing ones
        </p>
        <ImageCarousel onDelete={deleteImage} imageUrls={signedImageUrls} />
      </>
    )
  );
};

export default SignedImageViewer;
