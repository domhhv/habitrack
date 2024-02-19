import type { AddOccurrence, Occurrence, ServerOccurrence } from '@models';
import {
  transformClientEntity,
  transformServerEntities,
  transformServerEntity,
} from '@utils';

import {
  Collections,
  destroy,
  patch,
  post,
  type PatchEntity,
  getInRange,
} from './supabase';

export const createOccurrence = (occurrence: AddOccurrence) => {
  const serverBody = transformClientEntity(occurrence);
  const serverOccurrence = post<Occurrence>(
    Collections.OCCURRENCES,
    serverBody
  );
  return transformServerEntity(serverOccurrence);
};

export const listOccurrences = async (range: [number, number]) => {
  const occurrences = await getInRange<ServerOccurrence>(
    Collections.OCCURRENCES,
    'timestamp',
    range
  );

  return transformServerEntities(occurrences) as unknown as Occurrence[];
};

export const updateOccurrence = async (
  id: number,
  occurrence: PatchEntity<Occurrence>
) => {
  const serverOccurrence = await patch<ServerOccurrence>(
    Collections.OCCURRENCES,
    id,
    occurrence
  );
  return transformServerEntity(serverOccurrence);
};

export const destroyOccurrence = (id: number) => {
  return destroy<Occurrence>(Collections.OCCURRENCES, id);
};
