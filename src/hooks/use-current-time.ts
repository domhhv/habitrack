import React from 'react';

const useCurrentTime = () => {
  const [now, setNow] = React.useState(() => {
    return new Date();
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return now;
};

export default useCurrentTime;
