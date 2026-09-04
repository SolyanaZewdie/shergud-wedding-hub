import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { LoadingState } from "@/components/state-blocks";
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

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const [form, setForm] = useState({
    wedding_date: "",
    wedding_location: "",
    guest_count: "",
    budget: "",
    theme: "",
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        user_id: user!.id,
        wedding_date: form.wedding_date || null,
        wedding_location: form.wedding_location || null,
        guest_count: form.guest_count ? Number(form.guest_count) : null,
        budget: form.budget ? Number(form.budget) : null,
        theme: form.theme || null,
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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl">Tell us about your wedding</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This helps us tailor prices and vendor suggestions. You can change it anytime.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="wedding_date">Wedding date</Label>
            <Input
              id="wedding_date"
              type="date"
              value={form.wedding_date || (existing.data?.wedding_date ?? "")}
              onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wedding_location">City</Label>
            <Input
              id="wedding_location"
              placeholder="Addis Ababa"
              defaultValue={existing.data?.wedding_location ?? ""}
              onChange={(e) => setForm({ ...form, wedding_location: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="guest_count">Guests</Label>
              <Input
                id="guest_count"
                type="number"
                min={1}
                placeholder="250"
                defaultValue={existing.data?.guest_count ?? ""}
                onChange={(e) => setForm({ ...form, guest_count: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (ETB)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                step={1000}
                placeholder="400000"
                defaultValue={existing.data?.budget ?? ""}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="theme">Theme or style</Label>
            <Input
              id="theme"
              placeholder="Traditional Habesha with modern touches"
              defaultValue={existing.data?.theme ?? ""}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Saving..." : "Save and continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
