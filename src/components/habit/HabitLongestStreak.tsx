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
  streak: Streak;
};

const HabitLongestStreak = ({ streak }: HabitLongestStreakProps) => {
  if (!streak.streakLength || !streak.streakStart || !streak.streakEnd) {
    return <span className="text-gray-400">None</span>;
  }

  const range = dateTimeFormat.formatRange(
    new Date(streak.streakStart),
    new Date(streak.streakEnd)
  );

  return (
    <Tooltip closeDelay={0}>
      <Tooltip.Trigger>
        <span>{streak.streakLength} days</span>
      </Tooltip.Trigger>
      <Tooltip.Content>{range}</Tooltip.Content>
    </Tooltip>
  );
};

export default HabitLongestStreak;
