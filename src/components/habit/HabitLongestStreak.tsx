import { Tooltip } from '@heroui/react';

import type { Streak } from '@models';

const options: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
  year: 'numeric',
};

const dateTimeFormat = new Intl.DateTimeFormat('en', options);

type HabitLongestStreakProps = {
  streak: Streak | undefined;
};

const HabitLongestStreak = ({ streak }: HabitLongestStreakProps) => {
  if (!streak?.streakLength) {
    return <span className="text-gray-400">None</span>;
  }

  const range = dateTimeFormat.formatRange(
    new Date(streak.streakStart || 0),
    new Date(streak.streakEnd || 0)
  );

  return (
    <Tooltip
      showArrow
      offset={12}
      closeDelay={0}
      content={range}
      color="primary"
    >
      <span>{streak.streakLength} days</span>
    </Tooltip>
  );
};

export default HabitLongestStreak;
