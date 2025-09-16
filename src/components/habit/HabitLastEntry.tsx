import {
  Button,
  Tooltip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  type Selection,
  DropdownTrigger,
} from '@heroui/react';
import { isSameDay, getLocalTimeZone } from '@internationalized/date';
import { CaretDown } from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import pluralize from 'pluralize';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import type { Habit } from '@models';
import { getLatestHabitOccurrenceTimestamp } from '@services';
import {
  isThisWeek,
  differenceInDays,
  differenceInWeeks,
  differenceInHours,
  differenceInMonths,
  getCurrentCalendarDateTime,
  getCalendarDateTimeFromTimestamp,
} from '@utils';

const HabitLastEntry = ({ id }: { id: Habit['id'] }) => {
  const [selectedDistanceFormat, setSelectedDistanceFormat] =
    React.useState<Selection>(new Set(['default']));
  const [latestOccurrenceTimestamp, setLatestOccurrenceTimestamp] =
    React.useState<number | null>(null);
  const localTimeZone = React.useMemo(getLocalTimeZone, []);

  const fullDateTimeFormatter = useDateFormatter({
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'long',
    timeZone: localTimeZone,
    year: 'numeric',
  });

  const fullMonthFormatter = useDateFormatter({
    day: 'numeric',
    month: 'long',
    timeZone: localTimeZone,
    year: 'numeric',
  });

  const dayFormatter = useDateFormatter({
    timeZone: localTimeZone,
    weekday: 'long',
  });

  React.useEffect(() => {
    getLatestHabitOccurrenceTimestamp(id).then(setLatestOccurrenceTimestamp);
  }, [id]);

  const selectedValue = React.useMemo(() => {
    return Array.from(selectedDistanceFormat).join(', ').replace(/_/g, '');
  }, [selectedDistanceFormat]);

  const formatRelativeDate = React.useCallback(
    (timestamp: number) => {
      const timestampDate = getCalendarDateTimeFromTimestamp(timestamp);
      const currentDate = getCurrentCalendarDateTime();

      switch (selectedValue) {
        case 'hours': {
          const hours = differenceInHours(timestampDate, currentDate);

          return hours === 0
            ? 'just now'
            : `${pluralize('hour', hours, true)} ago`;
        }

        case 'days': {
          const days = differenceInDays(timestampDate, currentDate);

          return `${pluralize('day', days, true)} ago`;
        }

        case 'weeks': {
          const weeks = differenceInWeeks(timestampDate, currentDate);

          return `${pluralize('week', weeks, true)} ago`;
        }

        case 'months': {
          const months = differenceInMonths(timestampDate, currentDate);

          return `${pluralize('month', months, true)} ago`;
        }

        case 'default': {
          if (isSameDay(timestampDate, currentDate)) {
            const hours = differenceInHours(timestampDate, currentDate);

            return hours === 0
              ? 'just now'
              : `${pluralize('hour', hours, true)} ago`;
          }

          if (isThisWeek(timestampDate)) {
            const daysDiff = differenceInDays(timestampDate, currentDate);

            if (daysDiff === 1) {
              return 'yesterday';
            }

            if (daysDiff === 2) {
              return 'day before yesterday';
            }

            const dayName = dayFormatter.format(
              timestampDate.toDate(localTimeZone)
            );

            return `this ${dayName}`;
          }

          const days = Math.abs(differenceInDays(timestampDate, currentDate));

          return `${pluralize('day', days, true)} ago`;
        }

        default: {
          return fullMonthFormatter.format(timestampDate.toDate(localTimeZone));
        }
      }
    },
    [selectedValue, dayFormatter, fullMonthFormatter, localTimeZone]
  );

  if (!latestOccurrenceTimestamp) {
    return <span className="text-gray-400">None</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip
        showArrow
        offset={12}
        color="primary"
        content={fullDateTimeFormatter.format(
          new Date(latestOccurrenceTimestamp)
        )}
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
  );
};

export default HabitLastEntry;
