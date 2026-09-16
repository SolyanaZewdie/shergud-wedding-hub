import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarHeart, Heart, MessageCircle, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Eyebrow } from "@/components/editorial";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatBirr } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Our Wedding — Shergud Dashboard" },
      {
        name: "description",
        content: "Track your wedding countdown, budget, saved vendors and vendor conversations.",
      },
      { property: "og:title", content: "Our Wedding — Shergud Dashboard" },
      {
        property: "og:description",
        content: "Your wedding countdown, budget, shortlist and vendor conversations in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, view } = useAuth();

  const data = useQuery({
    queryKey: ["couple-dashboard", user?.id],
    queryFn: async () => {
      const [couple, saved, conversations] = await Promise.all([
        supabase.from("couple_profiles").select("*").eq("user_id", user!.id).maybeSingle(),
        supabase
          .from("saved_vendors")
          .select("vendor_id", { count: "exact", head: true })
          .eq("couple_id", user!.id),
        supabase.from("conversations").select("id", { count: "exact", head: true }),
      ]);
      if (couple.error) throw couple.error;
      return {
        couple: couple.data,
        savedCount: saved.count ?? 0,
        conversationCount: conversations.count ?? 0,
      };
    },
    enabled: Boolean(user),
  });

  if (view !== "couple" && view !== "admin") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="This dashboard is for couples"
            description="Sign in as a couple or administrator to see the wedding planning dashboard."
          />
        </div>
      </div>
    );
  }

  if (data.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <LoadingState />
      </div>
    );
  }

  if (data.isError) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState onRetry={() => data.refetch()} />
        </div>
      </div>
    );
  }

  const couple = data.data?.couple;
  const daysAway = couple?.wedding_date
    ? Math.ceil((new Date(couple.wedding_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="grain border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <Eyebrow>Your wedding ledger</Eyebrow>
          <h1 className="type-display mt-5 text-balance">
            {profile?.full_name ? `${profile.full_name}'s wedding` : "Our wedding"}
          </h1>
          {couple?.wedding_date && daysAway !== null ? (
            <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="type-mega leading-none text-primary">
                {daysAway >= 0 ? daysAway : "—"}
              </span>
              <span className="type-label text-muted-foreground">
                {daysAway >= 0 ? "days until you say yes" : "congratulations, you did it"}
              </span>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {!couple ? (
          <EmptyState
            title="Let's set up your wedding"
            description="Add your date, city, guests and budget so we can tailor everything."
            action={
              <Button asChild>
                <Link to="/onboarding">Start setup</Link>
              </Button>
            }
          />
        ) : (
          <>
            <dl className="grid gap-x-10 border-t border-border sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={CalendarHeart}
                label="Wedding day"
                value={
                  couple.wedding_date
                    ? new Date(couple.wedding_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not set"
                }
                note={couple.wedding_location ?? undefined}
              />
              <StatCard
                icon={Wallet}
                label="Budget"
                value={formatBirr(couple.budget)}
                note={couple.guest_count ? `${couple.guest_count} guests` : undefined}
              />
              <StatCard
                icon={Heart}
                label="Shortlisted"
                value={String(data.data?.savedCount ?? 0)}
                note="vendors saved"
              />
              <StatCard
                icon={MessageCircle}
                label="Conversations"
                value={String(data.data?.conversationCount ?? 0)}
                note="with vendors"
              />
            </dl>

            <section className="mt-16 grid gap-10 border-t border-border pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
              <div>
                <Eyebrow>The details</Eyebrow>
                <dl className="mt-6 divide-y divide-border">
                  <Detail label="City" value={couple.wedding_location ?? "Not set"} />
                  <Detail label="Theme" value={couple.theme ?? "Not set"} />
                  <Detail
                    label="Guests"
                    value={couple.guest_count ? String(couple.guest_count) : "Not set"}
                  />
                  <Detail
                    label="Colours"
                    value={couple.colors?.length ? couple.colors.join(", ") : "Not set"}
                  />
                </dl>
                <Button variant="outline" size="sm" className="mt-8 type-label" asChild>
                  <Link to="/onboarding">Edit wedding details</Link>
                </Button>
              </div>

              <div className="grain rounded-lg border border-border bg-card p-6 sm:p-8">
                <Eyebrow>Next steps</Eyebrow>
                <p className="type-lede mt-4 text-muted-foreground">
                  Photographers and venues book first in Addis. Shortlist a few, then start a
                  conversation to check your date.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button asChild className="type-label">
                    <Link to="/vendors">Browse vendors</Link>
                  </Button>
                  <Button variant="outline" asChild className="type-label">
                    <Link to="/saved">My shortlist</Link>
                  </Button>
                  <Button variant="outline" asChild className="type-label">
                    <Link to="/messages">Messages</Link>
                  </Button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note?: string | undefined;
}) {
  return (
    <div className="border-b border-border py-6">
      <Icon className="size-4 text-primary" aria-hidden />
      <dt className="type-label mt-4 text-muted-foreground">{label}</dt>
      <dd className="font-display mt-2 text-2xl">{value}</dd>
      {note ? <p className="mt-1 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="type-label text-muted-foreground">{label}</dt>
      <dd className="text-right font-serif text-lg">{value}</dd>
    </div>
  );
}

