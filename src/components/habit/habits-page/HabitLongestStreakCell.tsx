import { Tooltip } from '@heroui/react';
import type { Streak } from '@models';
import { getLongestHabitStreak } from '@services';
import React from 'react';

const options: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const dateTimeFormat = new Intl.DateTimeFormat('en', options);

const HabitLongestStreakCell = ({ id }: { id: number }) => {
  const [longestStreak, setLongestStreak] = React.useState<Streak>({
    streakLength: null,
    streakStart: null,
    streakEnd: null,
  });

  React.useEffect(() => {
    getLongestHabitStreak(id).then((longestStreak) => {
      setLongestStreak(longestStreak);
    });
  }, [id]);

  const range = dateTimeFormat.formatRange(
    new Date(longestStreak.streakStart || 0),
    new Date(longestStreak.streakEnd || 0)
  );

  return longestStreak.streakLength ? (
    <Tooltip content={range} color="primary" showArrow offset={12}>
      <span>{longestStreak.streakLength} days</span>
    </Tooltip>
  ) : (
    <span className="text-gray-400">None</span>
  );
};

export default HabitLongestStreakCell;
