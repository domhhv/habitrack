import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useSwipeable } from 'react-swipeable';

type SwipeableContainerProps = {
  children: React.ReactNode;
  className?: string;
  direction: number;
  swipeKey: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
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

const SwipeableContainer = ({
  children,
  className,
  direction,
  onSwipeLeft,
  onSwipeRight,
  swipeKey,
}: SwipeableContainerProps) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...swipeHandlers} className={className}>
      <AnimatePresence mode="sync" initial={false} custom={direction}>
        <motion.div
          exit="exit"
          key={swipeKey}
          initial="enter"
          animate="center"
          custom={direction}
          variants={slideVariants}
          className="h-full w-full"
          transition={{
            opacity: { duration: 0.15 },
            x: { damping: 30, duration: 0.25, stiffness: 500, type: 'spring' },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SwipeableContainer;
