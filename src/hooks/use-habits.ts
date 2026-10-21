import type { Habit } from '@models';

import useAppLoaderData from './use-app-loader-data';

const NO_HABITS: Record<Habit['id'], Habit> = {};

const useHabits = () => {
  return useAppLoaderData()?.habits ?? NO_HABITS;
};

export default useHabits;
