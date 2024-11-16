import type { Occurrence } from '@models';
import { Badge, Button, Tooltip } from '@nextui-org/react';
import { Trash } from '@phosphor-icons/react';
import { getHabitIconUrl } from '@utils';
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
  const [{ habit }] = occurrences;
  const { name: habitName, iconPath, trait } = habit || {};
  const { color: traitColor } = trait || {};
  const iconUrl = getHabitIconUrl(iconPath);

  const chipStyle = {
    borderColor: colorOverride || traitColor,
  };

  const tooltipContent = (
    <div className="flex items-center justify-between gap-2">
      {habitName}
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
  );

  const renderChip = () => {
    const chip = (
      <div
        style={chipStyle}
        className="mr-1 mt-1 min-w-0 rounded-full border-1 bg-slate-100 p-1.5 dark:bg-slate-800"
        role="habit-chip"
      >
        <img
          src={iconUrl}
          alt={`${habitName} icon`}
          className="h-4 w-4 rounded"
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
