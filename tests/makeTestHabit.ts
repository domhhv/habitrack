import type { Habit } from '@models';

const makeTestHabit = () => {
  let id = 1;

  return (override: Partial<Habit> = {}): Habit => {
    return {
      createdAt: new Date().toISOString(),
      description: 'Test Description',
      iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
      id: override.id || id++,
      name: 'Test Habit',
      traitId: 1,
      updatedAt: new Date().toISOString(),
      userId: '1',
      trait: {
        color: '#000000',
        name: 'Test Trait Name',
      },
      ...override,
    };
  };
};

export default makeTestHabit();
