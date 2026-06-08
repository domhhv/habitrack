import { Toast } from '@heroui/react';
import React from 'react';

import type { SignedUrls, StorageBuckets } from '@models';
import { deleteFile, createSignedUrls } from '@services';
import { useConfirmationActions } from '@stores';
import { getErrorMessage } from '@utils';

import { ImageCarousel } from './index';

const SIGNED_URL_EXPIRY_SECONDS = 60 * 5;
const SIGNED_URL_REFRESH_INTERVAL_MS = (SIGNED_URL_EXPIRY_SECONDS - 60) * 1000;

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
  const { askConfirmation } = useConfirmationActions();
  const [imagePathBeingDeleted, setImagePathBeingDeleted] = React.useState('');
  const [signedImageUrls, setSignedImageUrls] = React.useState<SignedUrls>([]);

  React.useEffect(() => {
    if (!paths?.length) {
      setSignedImageUrls([]);

      return;
    }

    const loadSignedUrls = async () => {
      try {
        const signedUrls = await createSignedUrls(
          paths,
          SIGNED_URL_EXPIRY_SECONDS
        );

        setSignedImageUrls(signedUrls);
      } catch (error) {
        Toast.toast.danger(
          'Something went wrong while loading photo previews. Please try reloading the page.',
          { description: `Error details: ${getErrorMessage(error)}` }
        );
      }
    };

    void loadSignedUrls();

    const intervalId = setInterval(() => {
      void loadSignedUrls();
    }, SIGNED_URL_REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [paths]);

  const deleteImage = async (index: number) => {
    const path = paths?.[index];

    const confirmed = await askConfirmation({
      description: 'Deleting this image cannot be undone.',
    });

    if (!path || !confirmed) {
      return;
    }

    setImagePathBeingDeleted(path);

    try {
      await deleteFile(bucket, path);

      Toast.toast.success('Successfully deleted photo');

      setSignedImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls.splice(index, 1);

        return newUrls;
      });

      onDelete(path);
    } catch (error) {
      Toast.toast.danger('Failed to delete photo', {
        description: `Error details: ${getErrorMessage(error)}`,
      });
    } finally {
      setImagePathBeingDeleted('');
    }
  };

  return (
    signedImageUrls.length > 0 && (
      <>
        <p className="text-sm text-gray-500">
          You can add more photos or delete existing ones
        </p>
        <ImageCarousel
          onDelete={deleteImage}
          imageUrls={signedImageUrls}
          imagePathBeingDeleted={imagePathBeingDeleted}
        />
      </>
    )
  );
};

export default SignedImageViewer;
