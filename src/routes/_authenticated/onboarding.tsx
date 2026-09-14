import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingState } from "@/components/state-blocks";
import { Eyebrow } from "@/components/editorial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your wedding — Shergud" },
      {
        name: "description",
        content: "Tell Shergud your wedding date, city, guest count and budget to get started.",
      },
      { property: "og:title", content: "Set up your wedding — Shergud" },
      {
        property: "og:description",
        content: "Add your wedding date, city, guest count and budget to personalise Shergud.",
      },
    ],
  }),
  component: Onboarding,
});

type Form = {
  wedding_date: string;
  wedding_location: string;
  guest_count: string;
  budget: string;
  theme: string;
  colors: string;
};

const STEPS = [
  { key: "wedding_date", eyebrow: "One", question: "When are you celebrating?" },
  { key: "wedding_location", eyebrow: "Two", question: "Where will it be held?" },
  { key: "guest_count", eyebrow: "Three", question: "How many guests, roughly?" },
  { key: "budget", eyebrow: "Four", question: "What is your overall budget?" },
  { key: "theme", eyebrow: "Five", question: "How would you describe the style?" },
  { key: "colors", eyebrow: "Six", question: "Any colours you are set on?" },
] as const;

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const existing = useQuery({
    queryKey: ["couple-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couple_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(user),
  });

  const [form, setForm] = useState<Form>({
    wedding_date: "",
    wedding_location: "",
    guest_count: "",
    budget: "",
    theme: "",
    colors: "",
  });

  const initialised = useMemo(() => existing.data, [existing.data]);
  const value = (key: keyof Form) =>
    form[key] ||
    (key === "colors"
      ? (initialised?.colors ?? []).join(", ")
      : String((initialised as Record<string, unknown> | null | undefined)?.[key] ?? ""));

  const save = useMutation({
    mutationFn: async () => {
      const colors = value("colors")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const payload = {
        user_id: user!.id,
        wedding_date: value("wedding_date") || null,
        wedding_location: value("wedding_location") || null,
        guest_count: value("guest_count") ? Number(value("guest_count")) : null,
        budget: value("budget") ? Number(value("budget")) : null,
        theme: value("theme") || null,
        colors: colors.length ? colors : null,
      };
      if (existing.data) {
        const { error } = await supabase
          .from("couple_profiles")
          .update(payload)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("couple_profiles").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Your wedding details are saved");
      navigate({ to: "/dashboard" });
    },
    onError: () => toast.error("Couldn't save your details"),
  });

  if (existing.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <LoadingState />
      </div>
    );
  }

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const required = step < 2;
  const canAdvance = !required || value(current.key as keyof Form).trim().length > 0;

  function next() {
    if (isLast) save.mutate();
    else setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:py-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Eyebrow>Your wedding, in your words</Eyebrow>
          <h1 className="type-display mt-5 text-balance">
            Six quiet questions
            <span className="font-ethiopic mt-3 block text-2xl text-muted-foreground">ሽር ጉድ</span>
          </h1>
          <p className="type-lede mt-6 max-w-md text-muted-foreground">
            The first two help us shape prices and availability. The rest are optional and can be
            changed whenever you like.
          </p>

          <ol className="mt-10 space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.key} className="flex items-center gap-4">
                <span
                  className={`h-px flex-none transition-all ${
                    i <= step ? "w-10 bg-primary" : "w-6 bg-border"
                  }`}
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={`type-label text-left transition-colors ${
                    i === step
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  {s.question}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <form
          className="rounded-lg border border-border bg-card p-6 shadow-soft sm:p-10"
          onSubmit={(e) => {
            e.preventDefault();
            if (canAdvance) next();
          }}
        >
          <Eyebrow>
            {current.eyebrow} of six {required ? "· required" : "· optional"}
          </Eyebrow>
          <h2 className="type-title mt-4 text-balance">{current.question}</h2>

          <div className="mt-8 space-y-2">
            <Label htmlFor={current.key} className="type-label text-muted-foreground">
              {current.key === "colors"
                ? "Separate colours with commas"
                : current.key === "budget"
                  ? "In ETB"
                  : current.key === "guest_count"
                    ? "An estimate is fine"
                    : "Your answer"}
            </Label>
            <Input
              key={current.key}
              id={current.key}
              autoFocus
              type={
                current.key === "wedding_date"
                  ? "date"
                  : current.key === "guest_count" || current.key === "budget"
                    ? "number"
                    : "text"
              }
              placeholder={
                current.key === "wedding_location"
                  ? "Addis Ababa"
                  : current.key === "guest_count"
                    ? "250"
                    : current.key === "budget"
                      ? "400000"
                      : current.key === "theme"
                        ? "Traditional Habesha with modern touches"
                        : current.key === "colors"
                          ? "Terracotta, ivory, gold"
                          : ""
              }
              value={value(current.key as keyof Form)}
              onChange={(e) => setForm({ ...form, [current.key]: e.target.value })}
              className="h-14 border-0 border-b border-border bg-transparent px-0 text-2xl shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(s - 1, 0))}
              disabled={step === 0}
              className="type-label"
            >
              <ArrowLeft className="mr-2 size-4" aria-hidden /> Back
            </Button>

            <div className="flex items-center gap-3">
              {!required && !isLast ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="type-label text-muted-foreground"
                  onClick={() => setStep((s) => s + 1)}
                >
                  Skip
                </Button>
              ) : null}
              <Button type="submit" disabled={!canAdvance || save.isPending} className="type-label">
                {save.isPending
                  ? "Saving..."
                  : isLast
                    ? "Save and open my dashboard"
                    : "Continue"}
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
