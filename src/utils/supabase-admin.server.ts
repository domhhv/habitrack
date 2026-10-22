import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { type Database } from '@db-types';

let adminClient: SupabaseClient<Database> | null = null;

/**
 * Server-only Supabase client authenticated with the secret key. It bypasses Row Level Security, so
 * use it only for admin tasks that the signed-in user's client can't do, and never for reads or
 * writes on the user's behalf. The key is read from `process.env` at runtime, so it never reaches
 * the client bundle.
 */
export const getSupabaseAdminClient = () => {
  if (!adminClient) {
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!SUPABASE_URL || !secretKey) {
      throw new Error('Supabase URL and secret key must be provided');
    }

    adminClient = createClient<Database>(SUPABASE_URL, secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
};
