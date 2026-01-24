import { cn, Button, Spinner } from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import React from 'react';
import { useDateFormatter } from 'react-aria';

import type { Occurrence } from '@models';

import OccurrenceChip from './OccurrenceChip';

type OccurrenceListItemProps = {
  hasChip: boolean;
  isBeingRemoved: boolean;
  occurrence: Occurrence;
  onEdit: () => void;
  onRemove: () => void;
};

const OccurrenceListItem = ({
  hasChip,
  isBeingRemoved,
  occurrence,
  onEdit,
  onRemove,
}: OccurrenceListItemProps) => {
  const timeFormatter = useDateFormatter({
    hour: 'numeric',
    minute: 'numeric',
    timeZone: getLocalTimeZone(),
  });

  return (
    <li
      key={occurrence.id}
      className={cn(
        'border-neutral-500 py-2 not-last:border-b',
        hasChip && occurrence.note && 'pb-1'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            hasChip ? 'space-y-1 space-x-2' : 'whitespace-pre-wrap'
          )}
        >
          {!hasChip && (
            <>
              {occurrence.hasSpecificTime && (
                <span className="font-semibold">
                  {timeFormatter.format(new Date(occurrence.timestamp))}:{' '}
                </span>
              )}
              <span
                className={cn(
                  'italic',
                  !occurrence.note &&
                    occurrence.hasSpecificTime &&
                    'text-gray-400'
                )}
              >
                {occurrence.note?.content || '(no note)'}
              </span>
            </>
          )}
          {hasChip && (
            <>
              <div className="flex items-center gap-2">
                <OccurrenceChip
                  hasMargin={false}
                  hasCounter={false}
                  hasTooltip={false}
                  isClickable={false}
                  isHabitNameShown={true}
                  occurrences={[occurrence]}
                />
                {occurrence.hasSpecificTime && (
                  <span className="font-semibold">
                    {timeFormatter.format(new Date(occurrence.timestamp))}
                  </span>
                )}
              </div>
              {occurrence.note && (
                <div className="text-sm whitespace-pre-wrap">
                  <span className="italic">{occurrence.note.content}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            onPress={onEdit}
            color="secondary"
            isDisabled={isBeingRemoved}
            aria-label="edit-habit-entry"
            className="h-6 w-6 min-w-0 rounded-lg"
          >
            <PencilSimpleIcon
              size={14}
              fill="bold"
              className="dark:fill-white"
            />
          </Button>
          <Button
            isIconOnly
            color="danger"
            variant="light"
            onPress={onRemove}
            isLoading={isBeingRemoved}
            aria-label="delete-habit-entry"
            className="h-6 w-6 min-w-0 rounded-lg"
            spinner={
              <Spinner
                size="sm"
                color="danger"
                className="size-3.5 [&>div]:size-3.5"
              />
            }
          >
            <TrashSimpleIcon
              size={14}
              fill="bold"
              className="dark:fill-white"
            />
          </Button>
        </div>
      </div>
    </li>
  );
};

export default OccurrenceListItem;
