/**
 * Parses a field that carries nested data as JSON, or returns `fallback` when the field is missing.
 * Unreadable JSON throws before anything is written.
 */
const getFormJson = <T>(formData: FormData, name: string, fallback: T) => {
  const value = formData.get(name);

  if (typeof value !== 'string' || !value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`The ${name} field could not be read`);
  }
};

export default getFormJson;
