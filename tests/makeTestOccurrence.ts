import { type Occurrence } from '@models';

const makeTestOccurrence = (override: Partial<Occurrence> = {}): Occurrence => {
  return {
    createdAt: new Date().toISOString(),
    habitId: crypto.randomUUID(),
    id: crypto.randomUUID(),
    notes: [],
    photoPaths: [],
    timestamp: new Date().getTime(),
    updatedAt: null,
    userId: crypto.randomUUID(),
    habit: {
      iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
      name: 'Test Habit Name',
      ...(override.habit || {}),
      trait: {
        color: '#000000',
        id: override.habit?.trait?.id || crypto.randomUUID(),
        name: 'Test Trait Name',
        ...(override.habit?.trait || {}),
      },
    },
    ...override,
  };
};

export default makeTestOccurrence;
