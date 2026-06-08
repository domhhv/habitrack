import {
  Label,
  Button,
  Tooltip,
  Dropdown,
  type Selection,
} from '@heroui/react';
import { isSameDay, getLocalTimeZone } from '@internationalized/date';
import { CaretDownIcon } from '@phosphor-icons/react';
import capitalize from 'lodash.capitalize';
import pluralize from 'pluralize';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import {
  isThisWeek,
  differenceInDays,
  differenceInWeeks,
  differenceInHours,
  differenceInMonths,
  getCurrentCalendarDateTime,
  getCalendarDateTimeFromTimestamp,
} from '@utils';

type HabitLastEntryProps = {
  timestamp: number;
};

const HabitLastEntry = ({ timestamp }: HabitLastEntryProps) => {
  const [selectedDistanceFormat, setSelectedDistanceFormat] =
    React.useState<Selection>(new Set(['default']));
  const localTimeZone = React.useMemo(() => {
    return getLocalTimeZone();
  }, []);

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

  if (!timestamp) {
    return <span className="text-gray-400">None</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Tooltip closeDelay={0}>
        <Tooltip.Trigger>
          <span>{capitalize(formatRelativeDate(timestamp))}</span>
        </Tooltip.Trigger>
        <Tooltip.Content offset={12}>
          <Tooltip.Arrow />
          {fullDateTimeFormatter.format(new Date(timestamp))}
        </Tooltip.Content>
      </Tooltip>
      <Dropdown>
        <Dropdown.Trigger>
          <Button size="sm" isIconOnly variant="ghost">
            <CaretDownIcon />
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu
            disallowEmptySelection
            selectionMode="single"
            aria-label="Single selection example"
            selectedKeys={selectedDistanceFormat}
            onSelectionChange={setSelectedDistanceFormat}
          >
            <Dropdown.Item id="default">
              <Label>Default</Label>
            </Dropdown.Item>
            <Dropdown.Item id="hours">
              <Label>Hours</Label>
            </Dropdown.Item>
            <Dropdown.Item id="days">
              <Label>Days</Label>
            </Dropdown.Item>
            <Dropdown.Item id="weeks">
              <Label>Weeks</Label>
            </Dropdown.Item>
            <Dropdown.Item id="months">
              <Label>Months</Label>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
};

export default HabitLastEntry;
