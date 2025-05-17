import type { Habit } from '@models';

const makeTestHabit = (override: Partial<Habit> = {}) => {
  return {
    createdAt: new Date().toISOString(),
    description: 'Test Description',
    iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
    id: crypto.randomUUID(),
    name: 'Test Habit',
    traitId: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
    userId: crypto.randomUUID(),
    trait: {
      color: '#000000',
      name: 'Test Trait Name',
      ...(override.trait || {}),
    },
    ...override,
  };
};

export default makeTestHabit;
