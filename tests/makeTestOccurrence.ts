import { Occurrence } from '@models';

const makeTestOccurrence = (override: Partial<Occurrence> = {}): Occurrence => {
  return {
    id: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timestamp: new Date().getTime(),
    day: '2021-01-01',
    time: '12:00',
    habitId: 1,
    userId: '1',
    ...override,
  };
};

export default makeTestOccurrence;
