import { type CamelCasedPropertiesDeep } from 'type-fest';

import type { Tables, Constants, TablesUpdate } from '@db-types';

export type Profile = CamelCasedPropertiesDeep<Tables<'profiles'>>;

export type ProfilesUpdate = CamelCasedPropertiesDeep<TablesUpdate<'profiles'>>;

export type DaysOfWeek =
  (typeof Constants)['public']['Enums']['days_of_week'][number];
