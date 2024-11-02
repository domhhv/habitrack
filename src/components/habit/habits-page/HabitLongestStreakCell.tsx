import React from 'react';

import { getLongestHabitStreak } from '@services';

const HabitLongestStreakCell = ({ id }: { id: number }) => {
  const [longestStreakLength, setLongestStreakLength] = React.useState<
    number | null
  >(null);

  React.useEffect(() => {
    getLongestHabitStreak(id).then((streakLength) => {
      setLongestStreakLength(streakLength);
    });
  }, [id]);

  return longestStreakLength ? (
    <p>{longestStreakLength} days</p>
  ) : (
    <p className="text-gray-400">None</p>
  );
};

export default HabitLongestStreakCell;
