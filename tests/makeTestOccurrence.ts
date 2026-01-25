import { type Occurrence } from '@models';

const makeTestOccurrence = (override: Partial<Occurrence> = {}): Occurrence => {
  return {
    createdAt: new Date().toISOString(),
    habitId: crypto.randomUUID(),
    hasSpecificTime: true,
    id: crypto.randomUUID(),
    note: null,
    occurredAt: new Date().toISOString(),
    photoPaths: [],
    timeZone: 'Europe/Madrid',
    updatedAt: null,
    userId: crypto.randomUUID(),
    habit: {
      iconPath: 'default.png',
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
