import { cn } from '@heroui/react';
import React, { type ReactNode, type AnimationEvent } from 'react';

type LandingRevealProps = {
  children: ReactNode;
};

const LandingReveal = ({ children }: LandingRevealProps) => {
  const [hasRevealed, setHasRevealed] = React.useState(false);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setHasRevealed(true);
    }
  };

  return (
    <div className="landing-reveal" onAnimationEnd={handleAnimationEnd}>
      <div
        className={cn(
          'min-h-0 motion-reduce:overflow-visible',
          !hasRevealed && 'overflow-hidden'
        )}
      >
        <div className="landing-slide-down">{children}</div>
      </div>
    </div>
  );
};

export default LandingReveal;
