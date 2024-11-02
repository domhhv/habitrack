import React from 'react';
import { formatDistanceStrict, formatRelative, isThisWeek } from 'date-fns';
import { enGB } from 'date-fns/locale';

import { getLatestHabitOccurrenceTimestamp } from '@services';
import { capitalizeFirstLetter } from '@utils';

const formatRelativeLocale: Record<string, string> = {
  yesterday: `'yesterday'`,
  today: `'today'`,
  tomorrow: `'tomorrow'`,
  lastWeek: `'this' EEEE`,
  nextWeek: `'next' EEEE`,
  other: `'on' LLL d, y`,
};

const HabitLastEntryCell = ({ id }: { id: number }) => {
  const [latestOccurrenceTimestamp, setLatestOccurrenceTimestamp] =
    React.useState<number | null>(null);

  React.useEffect(() => {
    getLatestHabitOccurrenceTimestamp(id).then(setLatestOccurrenceTimestamp);
  }, [id]);

  const formatRelativeDate = (timestamp: number) => {
    if (isThisWeek(timestamp)) {
      return formatRelative(timestamp, new Date(), {
        locale: {
          ...enGB,
          formatRelative: (token: string) => formatRelativeLocale[token],
        },
      });
    }

    return formatDistanceStrict(timestamp, new Date(), {
      locale: enGB,
      addSuffix: true,
      unit: 'day',
    });
  };

  return latestOccurrenceTimestamp ? (
    <p>
      {capitalizeFirstLetter(formatRelativeDate(latestOccurrenceTimestamp))}
    </p>
  ) : (
    <p className="text-gray-400">None</p>
  );
};

export default HabitLastEntryCell;
