import { createClient } from '@supabase/supabase-js';

// Zameni sa tvojim Supabase kredencijalima
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tvoj-projekt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tvoj-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
