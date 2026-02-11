// Supabase client configuration for browser and server

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key');
}

// Browser client (uses anon key, respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (uses service role, bypasses RLS)
// Falls back to anon key if service role key is not available
export const supabaseAdmin = createClient(
    supabaseUrl, 
    supabaseServiceRoleKey || supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Log warning if service role key is missing (only on server)
if (typeof window === 'undefined' && !supabaseServiceRoleKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Using anon key instead. Some operations may fail due to RLS policies.');
}

export default supabase;
