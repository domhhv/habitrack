import {
  AddHabitDialogButton,
  ConfirmDialog,
  EditHabitDialog,
} from '@components';
import { useHabits, useOccurrences } from '@context';
import { useDocumentTitle } from '@hooks';
import { Typography } from '@mui/joy';
import React from 'react';

import HabitItem from './HabitItem';
import { StyledList, StyledPageDiv } from './styled';

const HabitsPage = () => {
  const { habits, habitsMap, removeHabit } = useHabits();
  const [isEditingHabit, setIsEditingHabit] = React.useState(false);
  const [habitIdToEdit, setHabitIdToEdit] = React.useState(0);
  const [habitIdToRemove, setHabitIdToRemove] = React.useState(0);
  const [isRemovingHabit, setIsRemovingHabit] = React.useState(false);
  const { removeOccurrencesByHabitId } = useOccurrences();

  useDocumentTitle('My Habits | Habitrack');

  const handleRemovalConfirmOpen = (id: number) => {
    setHabitIdToRemove(id);
  };

  const handleRemovalCancel = () => {
    setHabitIdToRemove(0);
  };

  const handleRemovalConfirmed = async () => {
    setIsRemovingHabit(true);
    await removeHabit(habitIdToRemove);
    removeOccurrencesByHabitId(habitIdToRemove);
    setHabitIdToRemove(0);
    setIsRemovingHabit(false);
  };

  const handleEditStart = (habitId: number) => {
    setIsEditingHabit(true);
    setHabitIdToEdit(habitId);
  };

  const handleEditEnd = () => {
    setIsEditingHabit(false);
    setHabitIdToEdit(0);
  };

  return (
    <div className="flex w-full flex-col items-start justify-center self-start">
      <StyledPageDiv>
        <Typography level="h1">Your habits</Typography>
        <Typography level="body-md">Count: {habits.length}</Typography>
        <StyledList>
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onEdit={() => handleEditStart(habit.id)}
              onDelete={() => handleRemovalConfirmOpen(habit.id)}
            />
          ))}
        </StyledList>
        {!!habitIdToEdit && (
          <EditHabitDialog
            open={isEditingHabit}
            onClose={handleEditEnd}
            habit={habitsMap[habitIdToEdit]}
          />
        )}
        <AddHabitDialogButton />
        <ConfirmDialog
          open={!!habitIdToRemove}
          heading="Delete habit"
          onConfirm={handleRemovalConfirmed}
          onCancel={handleRemovalCancel}
          loading={isRemovingHabit}
        >
          <div>
            Are you sure you want to delete{' '}
            <strong>{habitsMap[habitIdToRemove]?.name}</strong> habit?
          </div>
        </ConfirmDialog>
      </StyledPageDiv>
    </div>
  );
};

export default HabitsPage;
