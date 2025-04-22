import type { CamelCasedPropertiesDeep } from 'type-fest';

const camelize = (key: string) => {
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

const deepCamelize = <T extends object>(
  entity: T
): CamelCasedPropertiesDeep<T> => {
  const serverEntries = Object.entries(entity || {}).map(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return {
        [camelize(key)]: deepCamelize(value),
      };
    }

    return {
      [camelize(key)]: value,
    };
  });

  return Object.assign({}, ...serverEntries);
};

export default deepCamelize;
