import type { Trait } from '@models';

const makeTestTrait = (override: Partial<Trait> = {}): Trait => {
  return {
    color: 'black',
    createdAt: new Date().toISOString(),
    description: 'Test Description',
    id: crypto.randomUUID(),
    name: 'Test Trait',
    updatedAt: null,
    userId: null,
    ...override,
  };
};

export default makeTestTrait;
