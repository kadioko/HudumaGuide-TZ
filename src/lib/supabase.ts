import { createClient } from "@supabase/supabase-js";
import { authStorage } from "@/lib/secureAuthStorage";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const canUseBrowserClient = typeof window !== "undefined";

export const supabase =
  canUseBrowserClient && supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: authStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);
