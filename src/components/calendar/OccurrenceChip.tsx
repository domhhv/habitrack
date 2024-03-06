import { useHabits, useOccurrences } from '@context';
import { useHabitTraitChipColor, useScreenSize, useHabitIconUrl } from '@hooks';
import type { Occurrence } from '@models';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { ChipDelete, CircularProgress, Tooltip } from '@mui/joy';
import React from 'react';

import { StyledHabitChip, StyledOccurrenceHabitImg } from './styled';

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

  return (
    <Tooltip title={eventHabit.name} key={occurrence.id}>
      <StyledHabitChip
        sx={{
          backgroundColor: colorOverride || traitChipColor,
        }}
        variant="soft"
        key={occurrence.id}
        role="habit-chip"
        startDecorator={
          <StyledOccurrenceHabitImg
            src={iconUrl}
            alt={`${eventHabit.name} icon`}
          />
        }
        disabled={isBeingDeleted}
        endDecorator={screenSize < 1025 ? null : endDecorator}
      />
    </Tooltip>
  );
};

export default OccurrenceChip;
