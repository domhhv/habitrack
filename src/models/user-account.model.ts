import { type CamelCasedPropertiesDeep } from 'type-fest';

import { type Tables, type TablesUpdate } from '../../supabase/database.types';

export type Account = CamelCasedPropertiesDeep<Tables<'accounts'>>;
export type AccountUpdate = CamelCasedPropertiesDeep<TablesUpdate<'accounts'>>;
