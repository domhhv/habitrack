import { useFetchers } from 'react-router';

import { collectPendingHabitWrites } from '@utils';

/**
 * Habit deletions and stock changes that are still in flight.
 */
const usePendingHabitWrites = () => {
  return collectPendingHabitWrites(useFetchers());
};

export default usePendingHabitWrites;
