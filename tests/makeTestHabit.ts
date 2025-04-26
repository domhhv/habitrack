import type { Habit } from '@models';

const makeTestHabit = (override: Partial<Habit> = {}) => {
  return {
    createdAt: new Date().toISOString(),
    description: 'Test Description',
    iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
    id: override.id || crypto.randomUUID(),
    name: 'Test Habit',
    traitId: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    userId: override.userId || crypto.randomUUID,
    trait: {
      color: '#000000',
      name: 'Test Trait Name',
    },
    ...override,
  };
};

export default makeTestHabit;
