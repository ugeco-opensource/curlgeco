"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let browserKey = "";

export const getSupabaseBrowserClient = (url?: string, anonKey?: string) => {
  if (!url || !anonKey) {
    return null;
  }

  const nextKey = `${url}:${anonKey}`;
  if (!browserClient || browserKey !== nextKey) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    browserKey = nextKey;
  }

  return browserClient;
};
