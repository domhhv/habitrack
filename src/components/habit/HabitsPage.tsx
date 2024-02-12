import { useCalendarEvents, useHabits } from '@context';
import { styled, Typography } from '@mui/joy';
import React from 'react';

import { ConfirmDialog } from '../controls';

import HabitRow from './HabitRow';
import { AddHabitDialogButton } from './add-habit';
import { EditHabitDialog } from './edit-habit';

const StyledPageDiv = styled('div')({
  width: '90%',
  margin: '24px auto 0',
  padding: '0 16px',
  textAlign: 'center',
});

const StyledList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  maxWidth: 400,
  margin: '0 auto 16px',
});

const HabitsPage = () => {
  const { habits, habitsMap } = useHabits();
  const [isEditingHabit, setIsEditingHabit] = React.useState(false);
  const [habitIdToEdit, setHabitIdToEdit] = React.useState(0);
  const [habitIdToDelete, setHabitIdToDelete] = React.useState(0);
  const [isDeletingHabit, setIsDeletingHabit] = React.useState(false);
  const { removeHabit } = useHabits();
  const { removeCalendarEventsByHabitId } = useCalendarEvents();

  const handleOpenDeleteConfirm = (id: number) => {
    setHabitIdToDelete(id);
  };

  const handleDeleteCancel = () => {
    setHabitIdToDelete(0);
  };

  const handleDeleteHabit = async () => {
    setIsDeletingHabit(true);
    await removeHabit(habitIdToDelete);
    removeCalendarEventsByHabitId(habitIdToDelete);
    setHabitIdToDelete(0);
    setIsDeletingHabit(false);
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
    <StyledPageDiv>
      <Typography level="h1">Your habits</Typography>
      <Typography level="body-md">Count: {habits.length}</Typography>
      <StyledList>
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            onEdit={() => handleEditStart(habit.id)}
            onDelete={() => handleOpenDeleteConfirm(habit.id)}
          />
        ))}
      </StyledList>
      <EditHabitDialog
        open={isEditingHabit}
        onClose={handleEditEnd}
        habit={habitsMap[habitIdToEdit]}
      />
      <AddHabitDialogButton />
      {!!habitIdToDelete && (
        <ConfirmDialog
          open={!!habitIdToDelete}
          heading="Delete habit"
          onConfirm={handleDeleteHabit}
          onCancel={handleDeleteCancel}
          loading={isDeletingHabit}
        >
          Are you sure you want to delete{' '}
          <strong>{habitsMap[habitIdToDelete].name.toLowerCase()}</strong>{' '}
          habit?
        </ConfirmDialog>
      )}
    </StyledPageDiv>
  );
};

export default HabitsPage;
