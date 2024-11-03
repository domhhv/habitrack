import {
  transformClientEntity,
  transformServerEntity,
  transformClientEntities,
  transformServerEntities,
} from './transformEntity';

describe('transformEntity', () => {
  it('should transform a server entity to client entity', () => {
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

    const result = transformServerEntity(serverEntity);

    expect(result).toEqual(clientEntity);
  });

  it('should transform a client entity to server entity', () => {
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

    const result = transformClientEntity(clientEntity);

    expect(result).toEqual(serverEntity);
  });

  it('should transform client entities to server entities', () => {
    const clientEntities = [
      {
        id: 'id',
        name: 'name',
        description: 'description',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
      },
      {
        id: 'id2',
        name: 'name2',
        description: 'description2',
        createdAt: 'Created at 2',
        updatedAt: 'Updated at 2',
      },
    ];

    const serverEntities = [
      {
        id: 'id',
        name: 'name',
        description: 'description',
        created_at: 'Created at',
        updated_at: 'Updated at',
      },
      {
        id: 'id2',
        name: 'name2',
        description: 'description2',
        created_at: 'Created at 2',
        updated_at: 'Updated at 2',
      },
    ];

    const result = transformClientEntities(clientEntities);

    expect(result).toEqual(serverEntities);
  });

  it('should transform server entities to client entities', () => {
    const serverEntities = [
      {
        id: 'id',
        name: 'name',
        description: 'description',
        created_at: 'Created at',
        updated_at: 'Updated at',
      },
      {
        id: 'id2',
        name: 'name2',
        description: 'description2',
        created_at: 'Created at 2',
        updated_at: 'Updated at 2',
      },
    ];

    const clientEntities = [
      {
        id: 'id',
        name: 'name',
        description: 'description',
        createdAt: 'Created at',
        updatedAt: 'Updated at',
      },
      {
        id: 'id2',
        name: 'name2',
        description: 'description2',
        createdAt: 'Created at 2',
        updatedAt: 'Updated at 2',
      },
    ];

    const result = transformServerEntities(serverEntities);

    expect(result).toEqual(clientEntities);
  });
});
