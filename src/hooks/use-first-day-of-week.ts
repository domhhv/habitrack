import { useUser } from '@stores';

const firstDaysOfWeek = ['sun', 'mon'] as const;

const useFirstDayOfWeek = () => {
  const { isLoading, user } = useUser();
  const userFirstDayOfWeek = user?.userMetadata.firstDayOfWeek;
  const firstDayOfWeekIndex =
    typeof userFirstDayOfWeek === 'number' &&
    userFirstDayOfWeek >= 0 &&
    userFirstDayOfWeek < 2
      ? userFirstDayOfWeek
      : 0;

  const firstDayOfWeek = firstDaysOfWeek[firstDayOfWeekIndex];

  return {
    firstDayOfWeek,
    firstDayOfWeekIndex,
    isLoadingFirstDayOfWeek: isLoading,
  };
};

export default useFirstDayOfWeek;
