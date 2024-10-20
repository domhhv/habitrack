import type { Trait } from '@models';

const makeTestTrait = () => {
  let id = 1;

  return (override: Partial<Trait> = {}): Trait => {
    return {
      id: id++,
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
};

export default makeTestTrait();
