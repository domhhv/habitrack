import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

const createSupabaseClient = () => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return {} as ReturnType<typeof createClient>;
};

export const supabaseClient = createSupabaseClient();
