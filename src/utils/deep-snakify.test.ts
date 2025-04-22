import { describe, it, expect } from 'vitest';

import deepSnakify from './deep-snakify';

describe(deepSnakify.name, () => {
  it('should deeply snakify an object', () => {
    const clientEntity = {
      id: 'id',
      name: 'name',
      description: 'description',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
    };

    const serverEntity = {
      id: 'id',
      name: 'name',
      description: 'description',
      created_at: 'Created at',
      updated_at: 'Updated at',
    };

    const result = deepSnakify(clientEntity);

    expect(result).toEqual(serverEntity);
  });
});
