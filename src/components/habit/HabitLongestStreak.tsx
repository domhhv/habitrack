import { Tooltip } from '@heroui/react';
import React from 'react';

import type { Streak } from '@models';
import { getLongestHabitStreak } from '@services';

const options: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
  year: 'numeric',
};

const dateTimeFormat = new Intl.DateTimeFormat('en', options);

const HabitLongestStreak = ({ id }: { id: number }) => {
  const [longestStreak, setLongestStreak] = React.useState<Streak>({
    streakEnd: null,
    streakLength: null,
    streakStart: null,
  });

  React.useEffect(() => {
    getLongestHabitStreak(id).then(setLongestStreak);
  }, [id]);

  const range = dateTimeFormat.formatRange(
    new Date(longestStreak.streakStart || 0),
    new Date(longestStreak.streakEnd || 0)
  );

  return longestStreak.streakLength ? (
    <Tooltip showArrow offset={12} content={range} color="primary">
      <span>{longestStreak.streakLength} days</span>
    </Tooltip>
  ) : (
    <span className="text-gray-400">None</span>
  );
};

export default HabitLongestStreak;
