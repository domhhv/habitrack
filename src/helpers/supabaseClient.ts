import { type Database } from '@db-types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

class SupabaseClientSingleton {
  private static instance: SupabaseClient<Database> | null = null;
  private client: SupabaseClient<Database>;

  private constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL and ANON KEY must be provided');
    }

    this.client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  public static getInstance(): SupabaseClient<Database> {
    if (!this.instance) {
      this.instance = new SupabaseClientSingleton().client;
    }

    return this.instance;
  }
}

const supabaseClient = SupabaseClientSingleton.getInstance();

export default supabaseClient;
