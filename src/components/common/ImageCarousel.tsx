import { Button, Tooltip } from '@heroui/react';
import {
  TrashIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ArrowSquareOutIcon,
} from '@phosphor-icons/react';
import React, { useState } from 'react';

import type { SignedUrls } from '@models';

import SwipeableContainer from './SwipeableContainer';

type ImageCarouselProps = {
  height?: string;
  imagePathBeingDeleted: string;
  imageUrls: SignedUrls;
  width?: string;
  onDelete: (index: number) => void;
};

const ImageCarousel = ({
  height = 'h-64',
  imagePathBeingDeleted,
  imageUrls,
  onDelete,
  width = 'w-full',
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (imageUrls.length <= 1) {
      return;
    }

    setDirection(1);
    setCurrentIndex((prevIndex) => {
      return (prevIndex + 1) % imageUrls.length;
    });
  };

  const handlePrev = () => {
    if (imageUrls.length <= 1) {
      return;
    }

    setDirection(-1);
    setCurrentIndex((prevIndex) => {
      return (prevIndex - 1 + imageUrls.length) % imageUrls.length;
    });
  };

  const handleDelete = (index: number) => {
    if (!onDelete) {
      return;
    }

    onDelete(index);
  };

  if (imageUrls.length === 0) {
    return (
      <div
        className={`relative flex items-center justify-center ${width} ${height} bg-gray-100`}
      >
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const currentImageUrl = imageUrls[currentIndex];

  return (
    <div className={`relative overflow-hidden ${width} ${height} bg-gray-100`}>
      <SwipeableContainer
        direction={direction}
        onSwipeLeft={handleNext}
        onSwipeRight={handlePrev}
        className="absolute inset-0"
        swipeKey={String(currentIndex)}
      >
        {!!currentImageUrl.error && (
          <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-red-500/50">
            <p className="text-white">Error loading image</p>
          </div>
        )}
        {!!currentImageUrl.signedUrl && (
          <img
            draggable={false}
            alt={`Slide ${currentIndex}`}
            src={currentImageUrl.signedUrl}
            className="h-full w-full rounded-lg object-cover select-none"
          />
        )}
      </SwipeableContainer>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between p-4">
        <Button
          size="sm"
          isIconOnly
          radius="full"
          variant="shadow"
          onPress={handlePrev}
          className="pointer-events-auto"
          isDisabled={imageUrls.length <= 1}
        >
          <CaretLeftIcon size={20} weight="bold" />
        </Button>

        <Button
          size="sm"
          isIconOnly
          radius="full"
          variant="shadow"
          onPress={handleNext}
          className="pointer-events-auto"
          isDisabled={imageUrls.length <= 1}
        >
          <CaretRightIcon size={20} weight="bold" />
        </Button>
      </div>

      <Tooltip closeDelay={0} content="Open this photo in a new tab">
        <div className="pointer-events-auto absolute top-4 right-14 z-10">
          <Button
            size="sm"
            isIconOnly
            radius="full"
            variant="shadow"
            color="secondary"
            onPress={() => {
              window.open(currentImageUrl.signedUrl, '_blank');
            }}
          >
            <ArrowSquareOutIcon size={18} weight="bold" />
          </Button>
        </div>
      </Tooltip>

      <Tooltip closeDelay={0} content="Delete this photo">
        <div className="pointer-events-auto absolute top-4 right-4 z-10">
          <Button
            size="sm"
            isIconOnly
            radius="full"
            color="danger"
            variant="shadow"
            isLoading={imagePathBeingDeleted === currentImageUrl.path}
            onPress={() => {
              handleDelete(currentIndex);
            }}
          >
            <TrashIcon size={18} weight="bold" />
          </Button>
        </div>
      </Tooltip>

      <div className="absolute right-0 bottom-4 left-0 z-10">
        <div className="mx-auto flex w-max items-center justify-center gap-2 rounded-full bg-black/30 p-2 backdrop-blur-xs">
          {imageUrls.map((_, index) => {
            return (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`rounded-full border border-white/30 shadow-xs transition-all ${
                  currentIndex === index
                    ? 'h-2 w-6 bg-white'
                    : 'h-2 w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
