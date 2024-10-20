import { createClient } from '@supabase/supabase-js';

import { type Database } from '../../supabase/database.types';

const createSupabaseClient = () => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return {} as ReturnType<typeof createClient>;
};

export const supabaseClient = createSupabaseClient();
