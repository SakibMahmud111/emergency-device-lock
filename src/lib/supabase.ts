import { createClient } from '@supabase/supabase-js';

// The .replace(/\/$/, '') regex pattern cleanly strips out any accidental trailing slashes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables inside configuration file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);