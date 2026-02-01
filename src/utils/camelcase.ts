import camelcaseKeys from 'camelcase-keys';

type SnakeRecord = Record<string, unknown>;

export const deepCamelcaseKeys = <T>(data: unknown): T => {
  return camelcaseKeys(data as SnakeRecord, { deep: true }) as T;
};

export const deepCamelcaseArray = <T>(data: unknown): T[] => {
  return camelcaseKeys(data as SnakeRecord[], { deep: true }) as T[];
};
