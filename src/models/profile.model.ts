import { type CamelCasedPropertiesDeep } from 'type-fest';

import { type Tables, type TablesInsert } from '@db-types';

export type Profile = CamelCasedPropertiesDeep<Tables<'profiles'>>;

export type ProfilesInsert = CamelCasedPropertiesDeep<TablesInsert<'profiles'>>;
