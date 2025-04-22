import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
  type Selection,
} from '@heroui/react';
import { CaretDown } from '@phosphor-icons/react';
import { getLatestHabitOccurrenceTimestamp } from '@services';
import { capitalize } from '@utils';
import {
  format,
  formatDistanceStrict,
  formatRelative,
  isThisWeek,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import pluralize from 'pluralize';
import React from 'react';

const formatRelativeLocale: Record<string, string> = {
  yesterday: `'yesterday'`,
  today: `'today'`,
  tomorrow: `'tomorrow'`,
  lastWeek: `'this' EEEE`,
  nextWeek: `'next' EEEE`,
  other: `'on' LLL d, y`,
};

const HabitLastEntry = ({ id }: { id: number }) => {
  const [selectedDistanceFormat, setSelectedDistanceFormat] =
    React.useState<Selection>(new Set(['default']));
  const [latestOccurrenceTimestamp, setLatestOccurrenceTimestamp] =
    React.useState<number | null>(null);

  React.useEffect(() => {
    getLatestHabitOccurrenceTimestamp(id).then(setLatestOccurrenceTimestamp);
  }, [id]);

  const selectedValue = React.useMemo(() => {
    return Array.from(selectedDistanceFormat).join(', ').replace(/_/g, '');
  }, [selectedDistanceFormat]);

  const formatRelativeDate = (timestamp: number) => {
    switch (selectedValue) {
      case 'hours': {
        const hours = differenceInHours(new Date(), timestamp);

        return `${pluralize('hour', hours, true)} ago`;
      }

      case 'days': {
        const days = differenceInDays(new Date(), timestamp);

        return `${pluralize('day', days, true)} ago`;
      }

      case 'weeks': {
        const weeks = differenceInWeeks(new Date(), timestamp);

        return `${pluralize('week', weeks, true)} ago`;
      }

      case 'months': {
        const months = differenceInMonths(new Date(), timestamp);

        return `${pluralize('month', months, true)} ago`;
      }

      case 'default':
        if (isThisWeek(timestamp)) {
          return formatRelative(timestamp, new Date(), {
            locale: {
              ...enGB,
              formatRelative: (token: string) => {
                return formatRelativeLocale[token];
              },
            },
          });
        }

        return formatDistanceStrict(timestamp, new Date(), {
          locale: enGB,
          addSuffix: true,
          unit: 'day',
        });

      default:
        return format(timestamp, 'MMMM do, y', {
          locale: enGB,
        });
    }
  };

  return latestOccurrenceTimestamp ? (
    <div className="flex items-center gap-2">
      <Tooltip
        content={format(new Date(latestOccurrenceTimestamp), 'MMMM do, y')}
        color="primary"
        showArrow
        offset={12}
      >
        <span>{capitalize(formatRelativeDate(latestOccurrenceTimestamp))}</span>
      </Tooltip>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light" size="sm">
            <CaretDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label="Single selection example"
          selectedKeys={selectedDistanceFormat}
          selectionMode="single"
          variant="flat"
          onSelectionChange={setSelectedDistanceFormat}
        >
          <DropdownItem key="default">Default</DropdownItem>
          <DropdownItem key="hours">Hours</DropdownItem>
          <DropdownItem key="days">Days</DropdownItem>
          <DropdownItem key="weeks">Weeks</DropdownItem>
          <DropdownItem key="months">Months</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ) : (
    <span className="text-gray-400">None</span>
  );
};

export default HabitLastEntry;
