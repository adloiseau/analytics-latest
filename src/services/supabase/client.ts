import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Ensure URL is valid before creating client
const validateUrl = (url: string) => {
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error('Invalid Supabase URL');
  }
};

export const supabaseClient = createClient<Database>(
  validateUrl(supabaseUrl),
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);