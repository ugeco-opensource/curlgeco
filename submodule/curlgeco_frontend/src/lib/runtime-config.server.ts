import type { RuntimeConfig } from "@/lib/runtime-config";
import { parseBoolean } from "@/lib/runtime-config";

export const getRuntimeConfig = (): RuntimeConfig => ({
  appName: "curlgeco",
  appDescription: "AI playground for model testing, prompt evaluation, and streaming chat.",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@ugeco.in",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || undefined,
  requireAuth: parseBoolean(process.env.NEXT_PUBLIC_REQUIRE_AUTH),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
});
