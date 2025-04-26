import type {
  SetRequired,
  RequireAtLeastOne,
  CamelCasedPropertiesDeep,
} from 'type-fest';

import type { Tables, TablesInsert, TablesUpdate } from '@db-types';

type BaseNote = CamelCasedPropertiesDeep<Tables<'notes'>>;

type NoteOccurrence = Omit<
  RequireAtLeastOne<BaseNote, 'occurrenceId'>,
  'periodDate' | 'periodKind'
>;

type NotePeriod = Omit<
  SetRequired<BaseNote, 'periodDate' | 'periodKind'>,
  'occurrenceId'
>;

export type Note = NoteOccurrence | NotePeriod;

type NoteCheck<T extends Partial<Tables<'notes'>>> =
  | Omit<RequireAtLeastOne<T, 'occurrence_id'>, 'period_date' | 'period_kind'>
  | Omit<SetRequired<T, 'period_date' | 'period_kind'>, 'occurrence_id'>;

export type NotesInsert = CamelCasedPropertiesDeep<
  NoteCheck<TablesInsert<'notes'>>
>;

export type NotesUpdate = CamelCasedPropertiesDeep<
  NoteCheck<TablesUpdate<'notes'>>
>;

export const noteTargetIsPeriod = (input: Note): input is NotePeriod => {
  if ('occurrenceId' in input && input.occurrenceId !== null) {
    return false;
  }

  return 'periodKind' in input && 'periodDate' in input;
};
