import { useHabits, useOccurrences } from '@context';
import { useHabitTraitChipColor, useScreenSize } from '@hooks';
import type { Occurrence } from '@models';
import { Spinner, Chip, Button, Tooltip, Badge } from '@nextui-org/react';
import { X } from '@phosphor-icons/react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

export type OccurrenceChipProps = {
  occurrences: Occurrence[];
  habitId: number;
  onDelete: (
    occurrenceId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => void;
  colorOverride?: string;
};

const OccurrenceChip = ({
  occurrences,
  habitId,
  onDelete,
  colorOverride,
}: OccurrenceChipProps) => {
  const { habitsMap } = useHabits();
  const { occurrenceIdBeingDeleted } = useOccurrences();
  const occurrenceHabit = habitsMap[habitId] || {};
  const traitChipColor = useHabitTraitChipColor(occurrenceHabit.traitId);
  const screenSize = useScreenSize();
  const iconUrl = getHabitIconUrl(occurrenceHabit.iconPath);

  const isBeingDeleted = occurrenceIdBeingDeleted === occurrences[0].id;

  const chipStyle = {
    backgroundColor: colorOverride || traitChipColor,
  };

  const startContent = (
    <img
      src={iconUrl}
      alt={`${occurrenceHabit.name} icon`}
      className="h-4 w-4 rounded"
    />
  );

  const getEndContent = () => {
    if (screenSize < 1025) {
      return null;
    }

    if (isBeingDeleted) {
      return <Spinner size="sm" role="habit-chip-delete-loader" />;
    }

    return (
      <Button
        isIconOnly
        radius="full"
        variant="solid"
        size="sm"
        onClick={(clickEvent) => onDelete(occurrences[0].id, clickEvent)}
        role="habit-chip-delete-button"
        className="h-4 w-4 min-w-0"
      >
        <X fontSize="large" size={12} />
      </Button>
    );
  };

  const renderChip = () => {
    const chip = (
      <Chip
        style={chipStyle}
        className="mr-1 mt-1 min-w-0 px-1 py-0.5"
        variant="solid"
        size="sm"
        role="habit-chip"
        startContent={startContent}
        isDisabled={isBeingDeleted}
        endContent={getEndContent()}
      />
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
    <Tooltip isDisabled={!occurrenceHabit.name} content={occurrenceHabit.name}>
      {renderChip()}
    </Tooltip>
  );
};

export default OccurrenceChip;
