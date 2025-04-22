import { describe, it, expect } from 'vitest';

import deepCamelize from './deep-camelize';

describe(deepCamelize.name, () => {
  it('should deeply camelize an object', () => {
    const serverEntity = {
      id: 'id',
      name: 'name',
      description: 'description',
      created_at: 'Created at',
      updated_at: 'Updated at',
    };

    const clientEntity = {
      id: 'id',
      name: 'name',
      description: 'description',
      createdAt: 'Created at',
      updatedAt: 'Updated at',
    };

    const result = deepCamelize(serverEntity);

    expect(result).toEqual(clientEntity);
  });
});
