import { it, expect, describe } from 'vitest';

import deepSnakify from './deep-snakify';

describe(deepSnakify.name, () => {
  it('should deeply snakify an object', () => {
    const clientEntity = {
      createdAt: 'Created at',
      description: 'description',
      id: 'id',
      name: 'name',
      updatedAt: 'Updated at',
    };

    const serverEntity = {
      created_at: 'Created at',
      description: 'description',
      id: 'id',
      name: 'name',
      updated_at: 'Updated at',
    };

    const result = deepSnakify(clientEntity);

    expect(result).toEqual(serverEntity);
  });
});
