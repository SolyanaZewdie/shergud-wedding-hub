// Portable Supabase client — use this when the project is exported to GitHub
// and deployed anywhere (Vercel, Netlify, your own server).
//
// How to switch:
//   1. Delete src/integrations/supabase/previewAuthStorage.ts
//   2. Replace src/integrations/supabase/client.ts with this file's contents
//      (rename this file to client.ts)
//   3. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your host's
//      environment variables
//
// Nothing else in the app changes: every screen imports `supabase` from
// "@/integrations/supabase/client".

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const SUPABASE_KEY = (import.meta.env["VITE_SUPABASE_ANON_KEY"] ||
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) as string | undefined;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your environment variables.",
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window === "undefined" ? undefined : window.localStorage,
    storageKey: "shergud-auth",
  },
});
