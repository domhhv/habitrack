import {
  type CamelCasedPropertiesDeep,
  type SnakeCasedPropertiesDeep,
} from 'type-fest';

const transformServerKey = (key: string) => {
  return key
    .split('_')
    .map((word, index) => {
      if (index === 0) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join('');
};

const transformClientKey = (key: string) => {
  return key
    .split('')
    .map((char) => {
      if (char === char.toUpperCase()) {
        return `_${char.toLowerCase()}`;
      }

      return char;
    })
    .join('');
};

export const transformServerEntity = <T extends object>(
  entity: T
): CamelCasedPropertiesDeep<T> => {
  const serverEntries = Object.entries(entity || {}).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return {
        [transformServerKey(key)]: transformServerEntity(value),
      };
    }

    return {
      [transformServerKey(key)]: value,
    };
  });

  return Object.assign({}, ...serverEntries);
};

export const transformClientEntity = <T extends object>(
  entity: T
): SnakeCasedPropertiesDeep<T> => {
  const clientEntries = Object.entries(entity || {}).map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return {
        [transformClientKey(key)]: transformClientEntity(value),
      };
    }

    return {
      [transformClientKey(key)]: value,
    };
  });

  return Object.assign({}, ...clientEntries);
};

export const transformServerEntities = <T extends object>(
  entities: T[]
): CamelCasedPropertiesDeep<T>[] => {
  return entities.map(transformServerEntity);
};

export const transformClientEntities = <T extends object>(
  entities: T[]
): SnakeCasedPropertiesDeep<T>[] => {
  return entities.map(transformClientEntity);
};
