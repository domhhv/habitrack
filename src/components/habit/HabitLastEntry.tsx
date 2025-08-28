import {
  Button,
  Tooltip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  type Selection,
  DropdownTrigger,
} from '@heroui/react';
import { CaretDown } from '@phosphor-icons/react';
import {
  format,
  isThisWeek,
  formatRelative,
  differenceInDays,
  differenceInHours,
  differenceInWeeks,
  differenceInMonths,
  formatDistanceStrict,
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import capitalize from 'lodash.capitalize';
import pluralize from 'pluralize';
import React from 'react';

import type { Habit } from '@models';
import { getLatestHabitOccurrenceTimestamp } from '@services';

const formatRelativeLocale: Record<string, string> = {
  lastWeek: `'this' EEEE`,
  nextWeek: `'next' EEEE`,
  other: `'on' LLL d, y`,
  today: `'today'`,
  tomorrow: `'tomorrow'`,
  yesterday: `'yesterday'`,
};

const HabitLastEntry = ({ id }: { id: Habit['id'] }) => {
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
          addSuffix: true,
          locale: enGB,
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
        showArrow
        offset={12}
        color="primary"
        content={format(new Date(latestOccurrenceTimestamp), 'MMMM do, y')}
      >
        <span>{capitalize(formatRelativeDate(latestOccurrenceTimestamp))}</span>
      </Tooltip>
      <Dropdown>
        <DropdownTrigger>
          <Button size="sm" isIconOnly variant="light">
            <CaretDown />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          variant="flat"
          disallowEmptySelection
          selectionMode="single"
          aria-label="Single selection example"
          selectedKeys={selectedDistanceFormat}
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
