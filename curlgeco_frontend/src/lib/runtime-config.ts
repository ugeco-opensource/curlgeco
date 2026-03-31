export interface RuntimeConfig {
  appName: string;
  appDescription: string;
  appUrl: string;
  supportEmail: string;
  gtmId?: string;
  requireAuth: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export const APP_STORAGE_KEY = "curlgeco-playground";
export const LEGACY_APP_STORAGE_KEY = "ugeco-model-lab";

export const parseBoolean = (value?: string) => {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
};

export const isSupabaseEnabled = (config: RuntimeConfig) =>
  Boolean(config.supabaseUrl && config.supabaseAnonKey);
