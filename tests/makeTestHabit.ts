import type { Habit } from '@models';

const makeTestHabit = (override: Partial<Habit> = {}): Habit => {
  return {
    id: 1,
    name: 'Test Habit',
    traitId: 'uuid',
    description: 'Test Description',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    iconPath: 'path/to/test/icon.png',
    ...override,
  };
};

export default makeTestHabit;
