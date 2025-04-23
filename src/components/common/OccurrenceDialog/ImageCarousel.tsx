import { Button, Tooltip } from '@heroui/react';
import {
  Trash,
  CaretLeft,
  CaretRight,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useRef, useState } from 'react';

import type { SignedUrls } from '@models';

interface ImageCarouselProps {
  imageUrls: SignedUrls;
  height?: string;
  width?: string;
  onDelete: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  height = 'h-64',
  imageUrls,
  onDelete,
  width = 'w-full',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevDirectionRef = useRef(direction);

  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    prevDirectionRef.current = direction;
  };

  const handleNext = () => {
    if (isAnimating || imageUrls.length <= 1) {
      return;
    }

    setDirection(1);
    setCurrentIndex((prevIndex) => {
      return (prevIndex + 1) % imageUrls.length;
    });
  };

  const handlePrev = () => {
    if (isAnimating || imageUrls.length <= 1) {
      return;
    }

    setDirection(-1);
    setCurrentIndex((prevIndex) => {
      return (prevIndex - 1 + imageUrls.length) % imageUrls.length;
    });
  };

  const handleDelete = (index: number) => {
    if (isAnimating || !onDelete) {
      return;
    }

    onDelete(index);
  };

  const slideVariants = {
    enter: (direction: number) => {
      return {
        opacity: 0,
        x: direction > 0 ? 500 : -500,
        zIndex: 0,
      };
    },
    exit: (direction: number) => {
      return {
        opacity: 0,
        x: direction > 0 ? -500 : 500,
        zIndex: 0,
      };
    },
    center: {
      opacity: 1,
      x: 0,
      zIndex: 1,
    },
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
      <AnimatePresence mode="sync" initial={false} custom={direction}>
        <motion.div
          exit="exit"
          initial="enter"
          animate="center"
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          className="absolute h-full w-full"
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
          transition={{
            opacity: { duration: 0.15 },
            x: { damping: 30, duration: 0.25, stiffness: 500, type: 'spring' },
          }}
        >
          {!!currentImageUrl.error && (
            <div className="absolute inset-0 flex items-center justify-center rounded bg-red-500/50">
              <p className="text-white">Error loading image</p>
            </div>
          )}
          {!!imageUrls[currentIndex].signedUrl && (
            <img
              alt={`Slide ${currentIndex}`}
              src={imageUrls[currentIndex].signedUrl}
              className="h-full w-full rounded-lg object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between p-4">
        <Button
          size="sm"
          isIconOnly
          variant="flat"
          onPress={handlePrev}
          isDisabled={isAnimating || imageUrls.length <= 1}
          className="pointer-events-auto rounded-full bg-white/80 text-gray-800 shadow-lg transition-all hover:bg-white/90"
          style={{
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CaretLeft size={20} weight="bold" />
        </Button>

        <Button
          size="sm"
          isIconOnly
          variant="flat"
          onPress={handleNext}
          isDisabled={isAnimating || imageUrls.length <= 1}
          className="pointer-events-auto rounded-full bg-white/80 text-gray-800 shadow-lg transition-all hover:bg-white/90"
          style={{
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CaretRight size={20} weight="bold" />
        </Button>
      </div>

      <Tooltip content="Open this photo in a new tab">
        <div className="pointer-events-auto absolute right-14 top-4 z-10">
          <Button
            size="sm"
            isIconOnly
            variant="flat"
            isDisabled={isAnimating}
            className="rounded-full bg-secondary-500 text-white shadow-lg transition-all hover:bg-secondary-600"
            onPress={() => {
              return window.open(currentImageUrl.signedUrl, '_blank');
            }}
            style={{
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            }}
          >
            <ArrowSquareOut size={18} weight="bold" />
          </Button>
        </div>
      </Tooltip>

      <Tooltip content="Delete this photo">
        <div className="pointer-events-auto absolute right-4 top-4 z-10">
          <Button
            size="sm"
            isIconOnly
            variant="flat"
            isDisabled={isAnimating}
            onPress={() => {
              return handleDelete(currentIndex);
            }}
            className="rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600"
            style={{
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Trash size={18} weight="bold" />
          </Button>
        </div>
      </Tooltip>

      <div className="absolute bottom-4 left-0 right-0 z-10">
        <div className="mx-auto flex w-max items-center justify-center gap-2 rounded-full bg-black/30 p-2 backdrop-blur-sm">
          {imageUrls.map((_, index) => {
            return (
              <button
                key={index}
                disabled={isAnimating}
                onClick={() => {
                  if (isAnimating) {
                    return;
                  }

                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`rounded-full border border-white/30 shadow-sm transition-all ${
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
