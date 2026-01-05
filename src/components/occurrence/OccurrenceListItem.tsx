import { Button } from '@heroui/react';
import { getLocalTimeZone } from '@internationalized/date';
import { TrashSimpleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useDateFormatter } from 'react-aria';

import type { Occurrence } from '@models';

type OccurrenceListItemProps = {
  occurrence: Occurrence;
  onEdit: () => void;
  onRemove: () => void;
};

const OccurrenceListItem = ({
  occurrence,
  onEdit,
  onRemove,
}: OccurrenceListItemProps) => {
  const timeFormatter = useDateFormatter({
    hour: 'numeric',
    minute: 'numeric',
    timeZone: getLocalTimeZone(),
  });

  const getTextContent = () => {
    if (occurrence.hasSpecificTime && occurrence.note) {
      return (
        <>
          <span className="font-semibold">
            {timeFormatter.format(new Date(occurrence.timestamp))}:{' '}
          </span>
          <span className="italic">{occurrence.note.content}</span>
        </>
      );
    }

    if (occurrence.hasSpecificTime && !occurrence.note) {
      return (
        <>
          <span className="font-semibold">
            {timeFormatter.format(new Date(occurrence.timestamp))}{' '}
          </span>
          <span className="text-gray-400 italic">(no note) </span>
        </>
      );
    }

    if (!occurrence.hasSpecificTime && occurrence.note) {
      return <span className="italic">{occurrence.note.content}</span>;
    }

    if (!occurrence.hasSpecificTime && !occurrence.note) {
      return <span className="italic">No note</span>;
    }
  };

  return (
    <li
      key={occurrence.id}
      className="mb-2 border-neutral-500 py-2 not-last:border-b"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="whitespace-pre-wrap">{getTextContent()}</div>
        <div className="flex items-center">
          <Button
            isIconOnly
            variant="light"
            onPress={onEdit}
            color="secondary"
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
            aria-label="delete-habit-entry"
            className="h-6 w-6 min-w-0 rounded-lg"
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
