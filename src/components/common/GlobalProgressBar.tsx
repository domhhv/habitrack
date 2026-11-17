import React from 'react';
import { useFetchers, useNavigation } from 'react-router';

const PROGRESS_BAR_DELAY_MS = 150;

const GlobalProgressBar = () => {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const isBusy =
    navigation.state !== 'idle' ||
    fetchers.some((fetcher) => {
      return fetcher.state !== 'idle';
    });
  const [hasDelayPassed, setHasDelayPassed] = React.useState(false);
  const isVisible = isBusy && hasDelayPassed;

  React.useEffect(() => {
    const timeout = setTimeout(
      () => {
        setHasDelayPassed(isBusy);
      },
      isBusy ? PROGRESS_BAR_DELAY_MS : 0
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [isBusy]);

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-busy={isVisible}
      aria-hidden={!isVisible}
      data-visible={isVisible}
      className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5 overflow-hidden opacity-0 transition-opacity duration-300 data-[visible=true]:opacity-100"
    >
      <div className="global-progress-indicator bg-accent h-full" />
    </div>
  );
};

export default GlobalProgressBar;
