import { Card, CardBody, CardHeader } from '@heroui/react';
import { parseDate, getLocalTimeZone } from '@internationalized/date';
import {
  SunIcon,
  CalendarIcon,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import type { NoteWithHabit } from '@models';
import { StorageBuckets } from '@models';
import { getPublicUrl } from '@services';

type NoteListItemProps = {
  note: NoteWithHabit;
};

type PeriodKind = 'day' | 'week' | 'month';

const PERIOD_ICONS: Record<PeriodKind, React.ReactNode> = {
  day: <SunIcon size={24} weight="bold" aria-label="Day note" />,
  month: <CalendarBlankIcon size={24} weight="bold" aria-label="Month note" />,
  week: <CalendarIcon size={24} weight="bold" aria-label="Week note" />,
};

const NoteListItem = ({ note }: NoteListItemProps) => {
  const dayFormatter = useDateFormatter({
    day: 'numeric',
    month: 'short',
    timeZone: getLocalTimeZone(),
    weekday: 'short',
    year: 'numeric',
  });

  const weekFormatter = useDateFormatter({
    month: 'short',
    timeZone: getLocalTimeZone(),
    year: 'numeric',
  });

  const monthFormatter = useDateFormatter({
    month: 'long',
    timeZone: getLocalTimeZone(),
    year: 'numeric',
  });

  const timestampFormatter = useDateFormatter({
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'short',
    timeZone: getLocalTimeZone(),
    year: 'numeric',
  });

  const isPeriodNote = 'periodKind' in note && note.periodKind;
  const isOccurrenceNote = 'occurrenceId' in note && note.occurrenceId;

  const getTitle = (): string => {
    if (isPeriodNote && note.periodDate) {
      const date = parseDate(note.periodDate).toDate(getLocalTimeZone());

      switch (note.periodKind) {
        case 'day':
          return dayFormatter.format(date);

        case 'week':
          return `Week of ${weekFormatter.format(date)}`;

        case 'month':
          return monthFormatter.format(date);

        default:
          return note.periodDate;
      }
    }

    if (isOccurrenceNote && note.habit?.name) {
      return note.habit.name;
    }

    return 'Note';
  };

  const renderIcon = () => {
    if (isPeriodNote && note.periodKind) {
      return (
        <div className="text-primary bg-primary-100 dark:bg-primary-900 flex h-10 w-10 items-center justify-center rounded-full">
          {PERIOD_ICONS[note.periodKind]}
        </div>
      );
    }

    if (isOccurrenceNote && note.habit?.iconPath) {
      return (
        <img
          className="h-10 w-10 object-cover"
          alt={note.habit.name || 'Habit icon'}
          src={getPublicUrl(StorageBuckets.HABIT_ICONS, note.habit.iconPath)}
        />
      );
    }

    return (
      <div className="text-default-500 bg-default-100 dark:bg-default-200 flex h-10 w-10 items-center justify-center rounded-full">
        <CalendarBlankIcon size={24} weight="bold" aria-label="Note" />
      </div>
    );
  };

  const formattedCreatedAtTimestamp = timestampFormatter.format(
    new Date(note.createdAt)
  );

  const formattedUpdatedAtTimestamp =
    note.updatedAt && timestampFormatter.format(new Date(note.updatedAt));

  return (
    <Card shadow="sm" className="w-full space-y-2">
      <CardHeader className="flex gap-3 pb-0">
        {renderIcon()}
        <div className="flex flex-col">
          <p className="text-md font-semibold">{getTitle()}</p>
          <p className="text-small text-default-500">
            {formattedCreatedAtTimestamp}
          </p>
        </div>
      </CardHeader>
      <CardBody className="space-y-1 pt-1">
        <p className="text-default-700 dark:text-default-600 whitespace-pre-wrap">
          {note.content}
        </p>
        {formattedUpdatedAtTimestamp && (
          <p className="text-default-500 text-xs italic">
            Last updated at {formattedUpdatedAtTimestamp}
          </p>
        )}
      </CardBody>
    </Card>
  );
};

export default NoteListItem;
