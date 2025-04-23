import type { Trait } from '@models';

const makeTestTrait = () => {
  let id = 1;

  return (override: Partial<Trait> = {}): Trait => {
    return {
      color: 'black',
      createdAt: new Date().toISOString(),
      description: 'Test Description',
      id: id++,
      name: 'Test Trait',
      slug: 'test-trait',
      updatedAt: new Date().toISOString(),
      userId: null,
      ...override,
    };
  };
};

export default makeTestTrait();
