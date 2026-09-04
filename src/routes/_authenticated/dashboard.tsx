import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarHeart, Heart, MessageCircle, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
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

  if (view !== "couple") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="This dashboard is for couples"
            description="Switch the view selector to the couple view to see the wedding dashboard."
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
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">
          {profile?.full_name ? `${profile.full_name}'s wedding` : "Our wedding"}
        </h1>

        {!couple ? (
          <div className="mt-8">
            <EmptyState
              title="Let's set up your wedding"
              description="Add your date, city, guests and budget so we can tailor everything."
              action={
                <Button asChild>
                  <Link to="/onboarding">Start setup</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                note={
                  daysAway !== null
                    ? daysAway >= 0
                      ? `${daysAway} days to go`
                      : "Congratulations!"
                    : undefined
                }
              />
              <StatCard
                icon={Wallet}
                label="Budget"
                value={formatBirr(couple.budget)}
                note={couple.guest_count ? `${couple.guest_count} guests` : undefined}
              />
              <StatCard
                icon={Heart}
                label="Saved vendors"
                value={String(data.data?.savedCount ?? 0)}
              />
              <StatCard
                icon={MessageCircle}
                label="Conversations"
                value={String(data.data?.conversationCount ?? 0)}
              />
            </div>

            <div className="mt-8 rounded-xl border border-border bg-card p-5">
              <h2 className="text-2xl">Details</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Detail label="City" value={couple.wedding_location ?? "Not set"} />
                <Detail label="Theme" value={couple.theme ?? "Not set"} />
              </dl>
              <Button variant="outline" size="sm" className="mt-5" asChild>
                <Link to="/onboarding">Edit wedding details</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/vendors">Browse vendors</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/saved">My shortlist</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/messages">Messages</Link>
              </Button>
            </div>
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
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl">{value}</p>
      {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
