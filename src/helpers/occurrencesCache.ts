import { type Occurrence } from '@models';

export const occurrencesCache: Map<string, Occurrence[]> = new Map();

export const cacheOccurrences = (
  range: [number, number],
  occurrences: Occurrence[]
) => {
  occurrencesCache.set(range.toString(), occurrences);
};

export const cacheOccurrence = (
  range: [number, number],
  occurrence: Occurrence
) => {
  const cachedOccurrences = occurrencesCache.get(range.toString());

  if (cachedOccurrences) {
    occurrencesCache.set(range.toString(), [...cachedOccurrences, occurrence]);
  }
};

export const uncacheOccurrence = (
  range: [number, number],
  occurrenceId: number
) => {
  const cachedOccurrences = occurrencesCache.get(range.toString());

  if (cachedOccurrences) {
    occurrencesCache.set(
      range.toString(),
      cachedOccurrences.filter((o) => o.id !== occurrenceId)
    );
  }
};
