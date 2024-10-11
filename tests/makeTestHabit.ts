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
    iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
    ...override,
  };
};

export default makeTestHabit;
