import { useHabits, useOccurrences } from '@context';
import { useHabitTraitChipColor } from '@hooks';
import type { Occurrence } from '@models';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ChipDelete, CircularProgress, Tooltip } from '@mui/joy';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import { StyledHabitChip } from './styled';

type OccurrenceChipProps = {
  occurrence: Occurrence;
  onDelete: (
    occurrenceId: number,
    clickEvent: React.MouseEvent<HTMLButtonElement>
  ) => void;
};

const OccurrenceChip = ({ occurrence, onDelete }: OccurrenceChipProps) => {
  const { habitsMap } = useHabits();
  const { occurrenceIdBeingDeleted } = useOccurrences();
  const eventHabit = habitsMap[occurrence.habitId!] || {};
  const traitChipColor = useHabitTraitChipColor(
    habitsMap[occurrence.habitId]?.traitId
  );

  const isBeingDeleted = occurrenceIdBeingDeleted === occurrence.id;

  const endDecorator = isBeingDeleted ? (
    <CircularProgress size="sm" />
  ) : (
    <ChipDelete
      variant="soft"
      color={traitChipColor}
      onClick={(clickEvent) => onDelete(occurrence.id, clickEvent)}
    >
      <DeleteForeverIcon fontSize="small" />
    </ChipDelete>
  );

  return (
    <Tooltip title={eventHabit.name} key={occurrence.id}>
      <StyledHabitChip
        variant="soft"
        color={traitChipColor}
        key={occurrence.id}
        startDecorator={
          <img
            src={getHabitIconUrl(eventHabit.iconPath)}
            alt={`${eventHabit.name} icon`}
            width={16}
            height={16}
          />
        }
        disabled={isBeingDeleted}
        endDecorator={endDecorator}
      />
    </Tooltip>
  );
};

export default OccurrenceChip;
