import { type Occurrence } from '@models';

const makeTestOccurrence = () => {
  let id = 999;

  return (override: Partial<Occurrence> = {}): Occurrence => {
    return {
      id: id++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timestamp: new Date().getTime(),
      habitId: 1,
      userId: '1',
      habit: {
        name: 'Test Habit Name',
        iconPath: 'https://i.ibb.co/vvgw7bx/habitrack-logo.png',
        trait: {
          id: 1,
          name: 'Test Trait Name',
          color: '#000000',
        },
      },
      notes: [],
      photoPaths: [],
      ...override,
    };
  };
};

export default makeTestOccurrence();
