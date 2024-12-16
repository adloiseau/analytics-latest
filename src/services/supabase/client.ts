import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { getEnvVariable } from '../../utils/environment';

const supabaseUrl = getEnvVariable('VITE_SUPABASE_URL');
const supabaseKey = getEnvVariable('VITE_SUPABASE_ANON_KEY');

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});