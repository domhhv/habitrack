import { type Tables, type TablesUpdate } from '@db-types';
import { type CamelCasedPropertiesDeep } from 'type-fest';

export type Account = CamelCasedPropertiesDeep<Tables<'accounts'>>;
export type AccountUpdate = CamelCasedPropertiesDeep<TablesUpdate<'accounts'>>;
