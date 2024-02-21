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

export const transformServerEntity = <T extends object>(entity: T): T => {
  const serverEntries = Object.entries(entity || {}).map(([key, value]) => {
    return {
      [transformServerKey(key)]: value,
    };
  });

  return Object.assign({}, ...serverEntries);
};

export const transformClientEntity = <T extends object>(entity: T) => {
  const clientEntries = Object.entries(entity || {}).map(([key, value]) => {
    return {
      [transformClientKey(key)]: value,
    };
  });

  return Object.assign({}, ...clientEntries);
};

export const transformServerEntities = <T extends object>(
  entities: T[]
): T[] => {
  return entities.map(transformServerEntity);
};

export const transformClientEntities = <T extends object>(
  entities: T[]
): T[] => {
  return entities.map(transformClientEntity);
};
