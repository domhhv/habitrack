import type { Habit } from '../src/models';

const makeTestHabit = (habit: Partial<Habit> = {}): Habit => {
  return {
    id: 1,
    name: 'Test Habit',
    traitId: 1,
    description: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    iconPath: 'path/to/test/icon.png',
    ...habit,
  };
};

export default makeTestHabit;
