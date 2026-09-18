"use client";
// src/presentation/providers/AuthProvider.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/infrastructure/config/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";
import type { UserRole } from "@/domain/entities/TrafficMetric";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  role: null,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchRole(userId: string) {
    try {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();
      setRole((data?.role as UserRole) ?? "user");
    } catch {
      setRole("user");
    }
  }

  useEffect(() => {
    import("@/infrastructure/services/authService").then(({ authService }) => {
      authService.getSession().then((session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRole(session.user.id).finally(() => setIsLoading(false));
        } else {
          setIsLoading(false);
        }
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          const token = newSession.access_token ?? "true";
          document.cookie = `sb-auth-token=${token}; path=/; max-age=3600; SameSite=Lax`;
          fetchRole(newSession.user.id);
        } else {
          document.cookie = `sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          setRole(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
