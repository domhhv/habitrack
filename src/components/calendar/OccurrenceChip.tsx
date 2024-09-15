import { useHabits, useOccurrences } from '@context';
import { useHabitTraitChipColor, useScreenSize } from '@hooks';
import type { Occurrence } from '@models';
import { Spinner, Chip, Button, Tooltip } from '@nextui-org/react';
import { X } from '@phosphor-icons/react';
import { getHabitIconUrl } from '@utils';
import React from 'react';

export type OccurrenceChipProps = {
  occurrence: Occurrence;
  onDelete: (
    occurrenceId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => void;
  colorOverride?: string;
};

const OccurrenceChip = ({
  occurrence,
  onDelete,
  colorOverride,
}: OccurrenceChipProps) => {
  const { habitsMap } = useHabits();
  const { occurrenceIdBeingDeleted } = useOccurrences();
  const eventHabit = habitsMap[occurrence.habitId!] || {};
  const traitChipColor = useHabitTraitChipColor(
    habitsMap[occurrence.habitId]?.traitId
  );
  const screenSize = useScreenSize();
  const iconUrl = getHabitIconUrl(eventHabit.iconPath);

  const isBeingDeleted = occurrenceIdBeingDeleted === occurrence.id;

  const chipStyle = {
    backgroundColor: colorOverride || traitChipColor,
  };

  const startContent = (
    <img
      src={iconUrl}
      alt={`${eventHabit.name} icon`}
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
        onClick={(clickEvent) => onDelete(occurrence.id, clickEvent)}
        role="habit-chip-delete-button"
        className="h-4 w-4 min-w-0"
      >
        <X fontSize="large" size={12} />
      </Button>
    );
  };

  return (
    <Tooltip content={eventHabit.name}>
      <Chip
        style={chipStyle}
        className="mr-0.5 mt-0.5 min-w-0 px-1 py-0.5"
        variant="solid"
        size="sm"
        role="habit-chip"
        startContent={startContent}
        isDisabled={isBeingDeleted}
        endContent={getEndContent()}
      />
    </Tooltip>
  );
};

export default OccurrenceChip;
