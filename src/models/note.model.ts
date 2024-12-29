import { type CamelCasedPropertiesDeep } from 'type-fest';

import {
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from '../../supabase/database.types';

export type Note = CamelCasedPropertiesDeep<Tables<'notes'>>;

export type NotesInsert = CamelCasedPropertiesDeep<TablesInsert<'notes'>>;

export type NotesUpdate = CamelCasedPropertiesDeep<TablesUpdate<'notes'>>;
