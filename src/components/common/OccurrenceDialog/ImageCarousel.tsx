import { Button, Tooltip } from '@heroui/react';
import {
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
  Trash,
} from '@phosphor-icons/react';
import type { SignedUrls } from '@services';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef } from 'react';

interface ImageCarouselProps {
  imageUrls: SignedUrls;
  height?: string;
  width?: string;
  onDelete: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  imageUrls,
  height = 'h-64',
  width = 'w-full',
  onDelete,
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
        x: direction > 0 ? 500 : -500,
        opacity: 0,
        zIndex: 0,
      };
    },
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction > 0 ? -500 : 500,
        opacity: 0,
        zIndex: 0,
      };
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
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 500, damping: 30, duration: 0.25 },
            opacity: { duration: 0.15 },
          }}
          className="absolute h-full w-full"
          onAnimationStart={handleAnimationStart}
          onAnimationComplete={handleAnimationComplete}
        >
          {!!currentImageUrl.error && (
            <div className="absolute inset-0 flex items-center justify-center rounded bg-red-500/50">
              <p className="text-white">Error loading image</p>
            </div>
          )}
          {!!imageUrls[currentIndex].signedUrl && (
            <img
              src={imageUrls[currentIndex].signedUrl}
              alt={`Slide ${currentIndex}`}
              className="h-full w-full rounded-lg object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between p-4">
        <Button
          isIconOnly
          variant="flat"
          size="sm"
          className="pointer-events-auto rounded-full bg-white/80 text-gray-800 shadow-lg transition-all hover:bg-white/90"
          style={{
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
          }}
          onPress={handlePrev}
          isDisabled={isAnimating || imageUrls.length <= 1}
        >
          <CaretLeft size={20} weight="bold" />
        </Button>

        <Button
          isIconOnly
          variant="flat"
          size="sm"
          className="pointer-events-auto rounded-full bg-white/80 text-gray-800 shadow-lg transition-all hover:bg-white/90"
          style={{
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
          }}
          onPress={handleNext}
          isDisabled={isAnimating || imageUrls.length <= 1}
        >
          <CaretRight size={20} weight="bold" />
        </Button>
      </div>

      <Tooltip content="Open this photo in a new tab">
        <div className="pointer-events-auto absolute right-14 top-4 z-10">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            className="rounded-full bg-secondary-500 text-white shadow-lg transition-all hover:bg-secondary-600"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
            onPress={() => {
              return window.open(currentImageUrl.signedUrl, '_blank');
            }}
            isDisabled={isAnimating}
          >
            <ArrowSquareOut size={18} weight="bold" />
          </Button>
        </div>
      </Tooltip>

      <Tooltip content="Delete this photo">
        <div className="pointer-events-auto absolute right-4 top-4 z-10">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            className="rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
            onPress={() => {
              return handleDelete(currentIndex);
            }}
            isDisabled={isAnimating}
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
                className={`rounded-full border border-white/30 shadow-sm transition-all ${
                  currentIndex === index
                    ? 'h-2 w-6 bg-white'
                    : 'h-2 w-2 bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => {
                  if (isAnimating) {
                    return;
                  }

                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                disabled={isAnimating}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
