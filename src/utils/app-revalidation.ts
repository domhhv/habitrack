let requestedVersion = 0;
let loadedVersion = 0;

export const markAppDataStale = () => {
  requestedVersion += 1;
};

export const isAppDataStale = () => {
  return requestedVersion !== loadedVersion;
};

export const trackAppDataLoad = (signal: AbortSignal) => {
  const version = requestedVersion;

  return () => {
    if (!signal.aborted) {
      loadedVersion = version;
    }
  };
};
