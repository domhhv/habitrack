import { useHabits, useOccurrences } from '@context';
import { useHabitTraitChipColor, useScreenSize, useHabitIconUrl } from '@hooks';
import type { Occurrence } from '@models';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ChipDelete, CircularProgress, Tooltip } from '@mui/joy';
import React from 'react';

import { StyledHabitChip } from './styled';

export type OccurrenceChipProps = {
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
  const screenSize = useScreenSize();
  const iconUrl = useHabitIconUrl(eventHabit.iconPath);

  const isBeingDeleted = occurrenceIdBeingDeleted === occurrence.id;

  const endDecorator = isBeingDeleted ? (
    <CircularProgress size="sm" role="habit-chip-delete-loader" />
  ) : (
    <ChipDelete
      variant="soft"
      onClick={(clickEvent) => onDelete(occurrence.id, clickEvent)}
      role="habit-chip-delete-button"
    >
      <DeleteForeverIcon fontSize="large" />
    </ChipDelete>
  );

  if (!eventHabit.name) return null;

  return (
    <Tooltip title={eventHabit.name} key={occurrence.id}>
      <StyledHabitChip
        sx={{
          backgroundColor: traitChipColor,
        }}
        variant="soft"
        key={occurrence.id}
        role="habit-chip"
        startDecorator={
          <img
            src={iconUrl}
            alt={`${eventHabit.name} icon`}
            width={20}
            height={20}
          />
        }
        disabled={isBeingDeleted}
        endDecorator={screenSize < 1025 ? null : endDecorator}
      />
    </Tooltip>
  );
};

export default OccurrenceChip;
