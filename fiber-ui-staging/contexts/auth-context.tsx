"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔐 AUTH PROVIDER: Initializing auth state (single instance)");
    const supabase = createClient();

    const getUser = async () => {
      try {
        console.log("🔐 AUTH PROVIDER: Single supabase.auth.getUser() call");
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("🔐 AUTH PROVIDER: getUser() failed or returned null, trying getSession()");
          // Fallback to getSession() if getUser() fails or returns null
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.user) {
            console.log("🔐 AUTH PROVIDER: User retrieved via getSession() fallback");
            setUser(session.user);
          } else {
            console.log("🔐 AUTH PROVIDER: No user found in session");
            setUser(null);
          }
        } else {
          console.log("🔐 AUTH PROVIDER: User retrieved:", user ? "authenticated" : "null");
          setUser(user);
        }
      } catch (error) {
        console.error("🔐 AUTH PROVIDER: Unexpected error:", error);
        // Last resort: try getSession()
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setUser(session?.user ?? null);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial user fetch
    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔐 AUTH PROVIDER: Auth state changed:",
        event,
        session?.user ? "authenticated" : "null",
      );
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
