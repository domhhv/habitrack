import { Tooltip } from '@nextui-org/react';
import { getLatestHabitOccurrenceTimestamp } from '@services';
import { capitalizeFirstLetter } from '@utils';
import {
  format,
  formatDistanceStrict,
  formatRelative,
  isThisWeek,
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import React from 'react';

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
    <Tooltip
      content={format(new Date(latestOccurrenceTimestamp), 'MMMM do, y')}
      color="primary"
      showArrow
      offset={12}
    >
      <span>
        {capitalizeFirstLetter(formatRelativeDate(latestOccurrenceTimestamp))}
      </span>
    </Tooltip>
  ) : (
    <span className="text-gray-400">None</span>
  );
};

export default HabitLastEntryCell;
