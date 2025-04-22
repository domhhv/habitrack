import { type SnakeCasedPropertiesDeep } from 'type-fest';

const snakify = (key: string) => {
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

const deepSnakify = <T extends object>(
  entity: T
): SnakeCasedPropertiesDeep<T> => {
  const clientEntries = Object.entries(entity || {}).map(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        [snakify(key)]: deepSnakify(value),
      };
    }

    return {
      [snakify(key)]: value,
    };
  });

  return Object.assign({}, ...clientEntries);
};

export default deepSnakify;
