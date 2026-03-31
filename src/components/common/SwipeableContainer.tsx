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

const SwipeableContainer = ({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableContainerProps) => {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...swipeHandlers} className={className}>
      {children}
    </div>
  );
};

export default SwipeableContainer;
