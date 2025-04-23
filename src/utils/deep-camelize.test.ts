import { it, expect, describe } from 'vitest';

import deepCamelize from './deep-camelize';

describe(deepCamelize.name, () => {
  it('should deeply camelize an object', () => {
    const serverEntity = {
      created_at: 'Created at',
      description: 'description',
      id: 'id',
      name: 'name',
      updated_at: 'Updated at',
    };

    const clientEntity = {
      createdAt: 'Created at',
      description: 'description',
      id: 'id',
      name: 'name',
      updatedAt: 'Updated at',
    };

    const result = deepCamelize(serverEntity);

    expect(result).toEqual(clientEntity);
  });
});
