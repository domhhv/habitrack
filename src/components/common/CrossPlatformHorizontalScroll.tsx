import { cn } from '@heroui/react';
import React, { type ReactNode } from 'react';

type HorizontalScrollProps = {
  children: ReactNode;
  className?: string;
};

const CrossPlatformHorizontalScroll = ({
  children,
  className,
}: HorizontalScrollProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current) {
        e.preventDefault();

        scrollRef.current.scrollLeft += e.deltaY;
      }
    };

    const element = scrollRef.current;

    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'scrollbar-hide overflow-x-auto overflow-y-hidden whitespace-nowrap',
        className
      )}
    >
      {children}
    </div>
  );
};

export default CrossPlatformHorizontalScroll;
