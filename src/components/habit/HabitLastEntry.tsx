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
import React from 'react';
import { useDateFormatter } from 'react-aria';

import type { Habit } from '@models';
import { getLatestHabitOccurrenceTimestamp } from '@services';

const HabitLastEntry = ({ id }: { id: Habit['id'] }) => {
  const dateFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
  });
  const timeFormatter = useDateFormatter({
    hour: 'numeric',
    minute: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [selectedDistanceFormat, setSelectedDistanceFormat] =
    React.useState<Selection>(new Set(['default']));
  const [latestOccurrenceTimestamp, setLatestOccurrenceTimestamp] =
    React.useState<number | null>(null);

  React.useEffect(() => {
    getLatestHabitOccurrenceTimestamp(id).then(setLatestOccurrenceTimestamp);
  }, [id]);

  return latestOccurrenceTimestamp ? (
    <div className="flex items-center gap-2">
      <Tooltip
        showArrow
        offset={12}
        color="primary"
        content={timeFormatter.format(new Date(latestOccurrenceTimestamp))}
      >
        <span>{dateFormatter.format(new Date(latestOccurrenceTimestamp))}</span>
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
