import type { Tables, TablesInsert, TablesUpdate } from '@db-types';
import type { RequireAtLeastOne, CamelCasedPropertiesDeep } from 'type-fest';

type NoteCheck<T extends Partial<Tables<'notes'>>> = RequireAtLeastOne<
  T,
  'day' | 'occurrence_id'
>;

export type Note = CamelCasedPropertiesDeep<NoteCheck<Tables<'notes'>>>;

export type NotesInsert = CamelCasedPropertiesDeep<
  NoteCheck<TablesInsert<'notes'>>
>;

export type NotesUpdate = CamelCasedPropertiesDeep<
  NoteCheck<TablesUpdate<'notes'>>
>;
