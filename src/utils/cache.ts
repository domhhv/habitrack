export const cache = new Map();

export const store = (key: unknown, value: unknown) => {
  cache.set(key, value);
};
