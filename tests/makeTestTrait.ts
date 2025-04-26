import type { Trait } from '@models';

const makeTestTrait = (override: Partial<Trait> = {}) => {
  return {
    color: 'black',
    createdAt: new Date().toISOString(),
    description: 'Test Description',
    id: override.id || crypto.randomUUID(),
    name: 'Test Trait',
    updatedAt: new Date().toISOString(),
    userId: null,
    ...override,
  };
};

export default makeTestTrait;
