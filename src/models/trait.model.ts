import { type CamelCasedPropertiesDeep } from 'type-fest';

import { type Tables, type TablesInsert } from '../../supabase/database.types';

export type Trait = CamelCasedPropertiesDeep<Tables<'traits'>>;

export type TraitsInsert = CamelCasedPropertiesDeep<TablesInsert<'traits'>>;
