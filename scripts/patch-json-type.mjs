#!/usr/bin/env node

/**
 * Patches the `Json` type in the generated Supabase types.
 *
 * Supabase generates a self-referential `Json` type:
 *
 *   export type Json =
 *     | string
 *     | number
 *     | boolean
 *     | null
 *     | { [key: string]: Json | undefined }
 *     | Json[]
 *
 * Its deep recursion makes camelcase-keys' type inference blow the TypeScript
 * instantiation depth limit (TS2589: "Type instantiation is excessively deep and
 * possibly infinite") wherever a Supabase row containing a JSON column is passed
 * through `camelcaseKeys(data, { deep: true })`.
 *
 * We replace it with a non-recursive form. Call sites already narrow JSON columns
 * (metric `config`/`value`) to their concrete shapes (MetricConfig / MetricValue),
 * so the loss of recursive precision is harmless.
 *
 * This script is chained into the `db:gen-types` yarn script so it runs after every
 * regeneration. It is idempotent: running it on an already-patched file is a no-op.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const typesPath = join(__dirname, '..', 'supabase', 'database.types.ts');

const GENERATED_JSON = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]`;

const PATCHED_JSON = `/**
* NOTE: This Json type is patched by scripts/patch-json-type.mjs after every
* \`yarn db:gen-types\`. Supabase generates a self-referential Json type whose deep
* recursion makes camelcase-keys' type inference blow the TS instantiation depth
* limit (TS2589). The non-recursive form below avoids that; call sites narrow
* JSON columns (e.g. metric config/value) to their concrete shapes anyway.
*/
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: unknown }
  | unknown[]`;

const source = readFileSync(typesPath, 'utf8');

if (source.includes(PATCHED_JSON)) {
  console.log('patch-json-type: Json type already patched, skipping.');
  process.exit(0);
}

if (!source.includes(GENERATED_JSON)) {
  console.error(
    'patch-json-type: could not find the generated Json type to patch.\n' +
      'The Supabase output format may have changed — update GENERATED_JSON in ' +
      'scripts/patch-json-type.mjs to match.'
  );
  process.exit(1);
}

writeFileSync(typesPath, source.replace(GENERATED_JSON, PATCHED_JSON));
console.log('patch-json-type: replaced Json type with non-recursive variant.');
