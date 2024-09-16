import {
  AddHabitDialogButton,
  ConfirmDialog,
  EditHabitDialog,
} from '@components';
import { useHabits, useOccurrences } from '@context';
import { useDocumentTitle } from '@hooks';
import React from 'react';

import HabitItem from './HabitItem';

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
      <div className="mx-auto mt-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300">
          Your habits
        </h1>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
          Count: {habits.length}
        </p>
        <ul className="mx-auto mb-4 max-w-[400px] list-none p-0">
          {habits.map((habit) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              onEdit={() => handleEditStart(habit.id)}
              onDelete={() => handleRemovalConfirmOpen(habit.id)}
            />
          ))}
        </ul>
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
      </div>
    </div>
  );
};

export default HabitsPage;
