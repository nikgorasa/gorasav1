"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  companyId?: string;
  walletBalance: number;
  loyaltyPoints: number;
  loyaltyTier: string;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInDemo: (email: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (email: string) => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchUserProfile(session.user.email!);
      }
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchUserProfile(session.user.email!);
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    // Try Supabase auth first
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If Supabase auth fails, try demo mode (direct DB lookup, no password check)
    if (error) {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return;
      }

      const apiErr = await res.json().catch(() => ({}));
      throw new Error(apiErr.error || error.message);
    }

    // If Supabase auth succeeds, sync with backend
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const userData = await res.json();
      setUser(userData);
    }
  };

  const signInDemo = async (email: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Demo login failed");
    }

    const userData = await res.json();
    setUser(userData);
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const refreshUser = async () => {
    if (supabaseUser?.email) {
      await fetchUserProfile(supabaseUser.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signInDemo,
        signUpWithEmail,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
