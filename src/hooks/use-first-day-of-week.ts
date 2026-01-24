import { useUser } from '@stores';

const firstDaysOfWeek = ['sun', 'mon'] as const;

const useFirstDayOfWeek = () => {
  const { user } = useUser();
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
  };
};

export default useFirstDayOfWeek;
