import type { Trait } from '@models';

const makeTestHabit = (override: Partial<Trait> = {}): Trait => {
  return {
    id: 1,
    name: 'Test Trait',
    slug: 'test-trait',
    description: 'Test Description',
    color: 'black',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: null,
    ...override,
  };
};

export default makeTestHabit;
