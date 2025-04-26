import { type Occurrence } from '@models';

const makeTestOccurrence = (override: Partial<Occurrence> = {}) => {
  return {
    createdAt: new Date().toISOString(),
    habitId: override.habitId || crypto.randomUUID(),
    id: override.id || crypto.randomUUID(),
    notes: [],
    photoPaths: [],
    timestamp: new Date().getTime(),
    updatedAt: new Date().toISOString(),
    userId: '1',
    habit: {
      iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
      name: 'Test Habit Name',
      trait: {
        color: '#000000',
        id: override.habit?.trait?.id || crypto.randomUUID(),
        name: 'Test Trait Name',
      },
    },
    ...override,
  };
};

export default makeTestOccurrence;
