import type {
  SetRequired,
  RequireAtLeastOne,
  CamelCasedPropertiesDeep,
} from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

type NoteOfOccurrence<T extends Partial<Tables<'notes'>> = Tables<'notes'>> =
  CamelCasedPropertiesDeep<
    Omit<RequireAtLeastOne<T, 'occurrence_id'>, 'period_date' | 'period_kind'>
  >;

export type NoteOfPeriod<T extends Partial<Tables<'notes'>> = Tables<'notes'>> =
  CamelCasedPropertiesDeep<
    Omit<SetRequired<T, 'period_date' | 'period_kind'>, 'occurrence_id'>
  >;

export type Note = NoteOfPeriod | NoteOfOccurrence;

export type NotePeriodKind = Tables<'notes'>['period_kind'];

type NoteCheck<T extends Partial<Tables<'notes'>>> =
  | NoteOfPeriod<T>
  | NoteOfOccurrence<T>;

export type NotesInsert = CamelCasedPropertiesDeep<
  NoteCheck<TablesInsert<'notes'>>
>;

export type NotesUpdate = CamelCasedPropertiesDeep<
  NoteCheck<TablesUpdate<'notes'>>
>;
