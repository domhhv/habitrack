import { type CamelCasedPropertiesDeep } from 'type-fest';

import { type Tables, type TablesInsert } from '../../supabase/database.types';

export type Note = CamelCasedPropertiesDeep<Tables<'notes'>>;

export type NotesInsert = CamelCasedPropertiesDeep<TablesInsert<'notes'>>;
