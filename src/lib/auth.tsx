import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "couple" | "vendor" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AppRole;
  avatar_url: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  /** Demo-mode view override. Never grants real privileges — the database decides. */
  demoView: AppRole | "auto";
  setDemoView: (view: AppRole | "auto") => void;
  /** Which dashboard the UI should present. Purely presentational. */
  view: AppRole | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = "shergud.demoView";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoView, setDemoViewState] = useState<AppRole | "auto">("auto");

  useEffect(() => {
    const stored = window.localStorage.getItem(DEMO_KEY);
    if (stored === "couple" || stored === "vendor" || stored === "admin") {
      setDemoViewState(stored);
    }
  }, []);

  const setDemoView = (next: AppRole | "auto") => {
    setDemoViewState(next);
    if (next === "auto") window.localStorage.removeItem(DEMO_KEY);
    else window.localStorage.setItem(DEMO_KEY, next);
  };

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("id", userId)
      .maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      if (data.session?.user) await loadProfile(data.session.user.id);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(nextSession ?? null);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
        void queryClient.invalidateQueries();
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? null;
    return {
      user: session?.user ?? null,
      session,
      profile,
      role,
      loading,
      demoView,
      setDemoView,
      view: demoView === "auto" ? role : demoView,
      refreshProfile: async () => {
        if (session?.user) await loadProfile(session.user.id);
      },
      signOut: async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
      },
    };
  }, [session, profile, loading, demoView, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
