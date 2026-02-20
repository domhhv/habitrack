import { useUser } from '@stores';

const firstDaysOfWeek = ['sun', 'mon'] as const;

// TODO: remove and use the corresponding value from to be integrated profile store
const useFirstDayOfWeek = () => {
  const { user } = useUser();
  const userFirstDayOfWeek = user?.userMetadata.firstDayOfWeek;
  const firstDayOfWeekIndex =
    typeof userFirstDayOfWeek === 'number' &&
    userFirstDayOfWeek >= 0 &&
    userFirstDayOfWeek < 2
      ? userFirstDayOfWeek
      : null;

  const firstDayOfWeek = firstDayOfWeekIndex
    ? firstDaysOfWeek[firstDayOfWeekIndex]
    : undefined;

  return {
    firstDayOfWeek,
  };
};

export default useFirstDayOfWeek;
