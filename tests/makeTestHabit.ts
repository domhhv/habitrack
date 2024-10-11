import type { Habit } from '@models';

const makeTestHabit = (override: Partial<Habit> = {}): Habit => {
  return {
    id: 1,
    name: 'Test Habit',
    traitId: 1,
    description: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    iconPath: './public/android-chrome-192x192.png',
    ...override,
  };
};

export default makeTestHabit;
