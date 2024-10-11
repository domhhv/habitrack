import { createClient } from '@supabase/supabase-js';

const createSupabaseClient = () => {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  return {} as ReturnType<typeof createClient>;
};

export const supabaseClient = createSupabaseClient();
