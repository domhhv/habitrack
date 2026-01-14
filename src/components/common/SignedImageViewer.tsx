import { addToast } from '@heroui/react';
import React from 'react';

import type { SignedUrls } from '@models';
import { StorageBuckets } from '@models';
import { deleteFile, createSignedUrls } from '@services';
import { getErrorMessage } from '@utils';

import { ImageCarousel } from './index';

type SignedImageViewerProps = {
  paths: string[] | null;
};

const SignedImageViewer = ({ paths }: SignedImageViewerProps) => {
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
    const success = await deleteFile(
      StorageBuckets.OCCURRENCE_PHOTOS,
      paths?.[index] || ''
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
