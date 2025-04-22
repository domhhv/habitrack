import type { Habit } from '@models';

const makeTestHabit = () => {
  let id = 1;

  return (override: Partial<Habit> = {}): Habit => {
    return {
      id: override.id || id++,
      name: 'Test Habit',
      traitId: 1,
      description: 'Test Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: '1',
      iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
      trait: {
        name: 'Test Trait Name',
        color: '#000000',
      },
      ...override,
    };
  };
};

export default makeTestHabit();
