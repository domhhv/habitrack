import { type Occurrence } from '@models';

const makeTestOccurrence = () => {
  let id = 999;

  return (override: Partial<Occurrence> = {}): Occurrence => {
    return {
      createdAt: new Date().toISOString(),
      habitId: 1,
      id: id++,
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
          id: 1,
          name: 'Test Trait Name',
        },
      },
      ...override,
    };
  };
};

export default makeTestOccurrence();
