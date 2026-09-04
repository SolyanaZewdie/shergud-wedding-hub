import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Search = { mode?: "login" | "signup" | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    mode: search["mode"] === "signup" ? "signup" : "login",
  }),
  head: () => ({
    meta: [
      { title: "Sign in to Shergud — Ethiopian Wedding Marketplace" },
      {
        name: "description",
        content:
          "Log in or create your Shergud account to plan your wedding or list your vendor business.",
      },
      { property: "og:title", content: "Sign in to Shergud" },
      { property: "og:description", content: "Access your Shergud couple or vendor account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"couple" | "vendor">("couple");
  const [busy, setBusy] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (role === "vendor") navigate({ to: "/vendor", replace: true });
    else if (role === "admin") navigate({ to: "/admin", replace: true });
    else navigate({ to: "/dashboard", replace: true });
  }, [loading, user, role, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role: accountType },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSentConfirmation(true);
          toast.success("Check your email to confirm your account.");
        } else {
          toast.success("Welcome to Shergud!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-8 flex items-baseline gap-2">
        <span className="font-display text-3xl text-primary">Shergud</span>
        <span className="font-display text-xl text-accent-foreground/70">ሽር ጉድ</span>
      </Link>

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isSignup
            ? "Plan your wedding or list your business on Shergud."
            : "Sign in to continue planning."}
        </p>

        {sentConfirmation ? (
          <div className="mt-6 rounded-lg border border-border bg-secondary/60 p-4 text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account, then come back and log in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignup ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["couple", "vendor"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAccountType(option)}
                        className={`rounded-md border px-3 py-2 text-sm capitalize transition-colors ${
                          accountType === option
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {option === "couple" ? "Couple" : "Vendor"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait..." : isSignup ? "Create account" : "Log in"}
            </Button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogle}>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "New to Shergud?"}{" "}
          <Link
            to="/auth"
            search={{ mode: isSignup ? "login" : "signup" }}
            className="text-primary underline underline-offset-4"
          >
            {isSignup ? "Log in" : "Create one"}
          </Link>
        </p>
      </div>
    </div>
  );
}
