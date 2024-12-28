import type { Occurrence } from '@models';
import { Badge, Button, Tooltip } from '@nextui-org/react';
import { Trash } from '@phosphor-icons/react';
import { useNotesStore } from '@stores';
import { getHabitIconUrl } from '@utils';
import { format } from 'date-fns';
import React from 'react';

export type OccurrenceChipProps = {
  occurrences: Occurrence[];
  onDelete: (
    occurrenceId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => void;
  colorOverride?: string;
};

const OccurrenceChip = ({
  occurrences,
  onDelete,
  colorOverride,
}: OccurrenceChipProps) => {
  const occurrenceIds = occurrences.map((o) => o.id);
  const [occurrence] = occurrences;
  const { habit } = occurrence;
  const { notes } = useNotesStore();
  const { name: habitName, iconPath, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const iconUrl = getHabitIconUrl(iconPath);
  const occurrenceTimes = occurrences.map((o) => ({
    occurrenceId: o.id,
    time: format(new Date(o.timestamp), 'p'),
  }));
  const occurrenceNotes = notes.filter(
    (n) => n.occurrenceId && occurrenceIds.includes(n.occurrenceId)
  );

  const chipStyle = {
    borderColor: colorOverride || traitColor,
  };

  const tooltipContent = (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">{habitName}</span>
        <Button
          isIconOnly
          variant="solid"
          color="danger"
          onClick={(clickEvent) => onDelete(occurrences[0].id, clickEvent)}
          role="habit-chip-delete-button"
          className="h-6 w-6 min-w-0 rounded-lg"
        >
          <Trash size={14} fill="bold" className="fill-white" />
        </Button>
      </div>
      <ul className="italic">
        {occurrenceTimes.map((t) => (
          <li key={t.occurrenceId}>
            <span className="font-semibold">{t.time}</span>:{' '}
            <span className="font-normal">
              {occurrenceNotes.find((n) => n.occurrenceId === t.occurrenceId)
                ?.content || 'No note'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderChip = () => {
    const chip = (
      <div
        style={chipStyle}
        className="relative mr-1 mt-1 min-w-0 rounded-full border-2 bg-slate-100 p-2 dark:bg-slate-800"
        role="habit-chip"
      >
        <img
          src={iconUrl}
          alt={`${habitName} icon`}
          className="h-5 w-5 rounded"
        />
      </div>
    );

    if (occurrences.length > 1) {
      return (
        <Badge
          size="sm"
          content={occurrences.length}
          variant="solid"
          placement="bottom-right"
          color="primary"
        >
          {chip}
        </Badge>
      );
    }

    return chip;
  };

  return (
    <Tooltip
      isDisabled={!habitName}
      content={tooltipContent}
      radius="sm"
      classNames={{
        content: 'px-2 py-1.5',
      }}
    >
      {renderChip()}
    </Tooltip>
  );
};

export default OccurrenceChip;
