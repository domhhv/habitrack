const useSystemTimeZone = () => {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();

  return timeZone;
};

export default useSystemTimeZone;
