import { type CamelCasedPropertiesDeep } from 'type-fest';

import { type Tables } from '../../supabase/database.types';

export type Account = CamelCasedPropertiesDeep<Tables<'accounts'>>;
