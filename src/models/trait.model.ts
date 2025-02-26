import { type Tables, type TablesInsert } from '@db-types';
import { type CamelCasedPropertiesDeep } from 'type-fest';

export type Trait = CamelCasedPropertiesDeep<Tables<'traits'>>;

export type TraitsInsert = CamelCasedPropertiesDeep<TablesInsert<'traits'>>;
