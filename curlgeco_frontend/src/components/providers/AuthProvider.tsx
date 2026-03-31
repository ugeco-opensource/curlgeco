"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useRuntimeConfig } from "@/components/providers/RuntimeConfigProvider";
import { isSupabaseEnabled } from "@/lib/runtime-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthActionResult {
  error?: string;
  requiresConfirmation?: boolean;
}

interface AuthContextValue {
  enabled: boolean;
  initialized: boolean;
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const config = useRuntimeConfig();
  const enabled = isSupabaseEnabled(config);
  const client = getSupabaseBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
  const [initialized, setInitialized] = useState(!enabled);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!client) {
      return;
    }

    let mounted = true;

    const syncSession = async () => {
      const { data } = await client.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setInitialized(true);
    };

    void syncSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const client = getSupabaseBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
    if (!client) {
      return { error: "Supabase auth is not configured yet." };
    }

    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signUp: AuthContextValue["signUp"] = async (name, email, password) => {
    const client = getSupabaseBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
    if (!client) {
      return { error: "Supabase auth is not configured yet." };
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return {
      requiresConfirmation: Boolean(data.user && !data.session),
    };
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    const client = getSupabaseBrowserClient(config.supabaseUrl, config.supabaseAnonKey);
    if (!client) {
      return {};
    }

    const { error } = await client.auth.signOut();
    if (error) {
      return { error: error.message };
    }

    return {};
  };

  return (
    <AuthContext.Provider
      value={{
        enabled,
        initialized: client ? initialized : true,
        user: client ? user : null,
        session: client ? session : null,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Auth provider is unavailable.");
  }
  return context;
};
