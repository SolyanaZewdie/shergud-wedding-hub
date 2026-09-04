import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Heart, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { VendorCard } from "@/components/VendorCard";
import { LoadingState } from "@/components/state-blocks";
import { Button } from "@/components/ui/button";
import { fetchListings, CATEGORIES } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shergud ሽር ጉድ — Find Trusted Ethiopian Wedding Vendors" },
      {
        name: "description",
        content:
          "Discover verified photographers, venues, caterers and decorators for your Ethiopian wedding. Save favourites, message vendors and plan with confidence.",
      },
      { property: "og:title", content: "Shergud ሽር ጉድ — Ethiopian Wedding Vendors" },
      {
        property: "og:description",
        content:
          "A warm, trustworthy marketplace connecting Ethiopian couples with verified wedding vendors.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { user, view } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["listings", { sort: "rating" }],
    queryFn: () => fetchListings({ sort: "rating" }),
  });

  const featured = (data ?? []).slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 pb-14 pt-16 text-center sm:px-6 sm:pt-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Ethiopian wedding marketplace
        </p>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl leading-[1.1] sm:text-6xl">
          Every great wedding starts with people you can trust
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          Shergud brings together verified photographers, venues, caterers and decorators — so you
          can plan the most important day of your life without guesswork.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/vendors">Browse vendors</Link>
          </Button>
          {user ? (
            <Button size="lg" variant="outline" asChild>
              <Link to={view === "vendor" ? "/vendor" : view === "admin" ? "/admin" : "/dashboard"}>
                Go to my dashboard
              </Link>
            </Button>
          ) : (
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Create an account
              </Link>
            </Button>
          )}
        </div>
        <div className="shergud-rule mx-auto mt-14 max-w-xs" />
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: BadgeCheck,
              title: "Verified vendors only",
              body: "Every business is reviewed by our team before it appears in search.",
            },
            {
              icon: Heart,
              title: "Save your shortlist",
              body: "Keep the vendors you love in one place and come back to them anytime.",
            },
            {
              icon: MessageCircle,
              title: "Talk before you commit",
              body: "Message vendors directly and get straight answers about price and dates.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-6">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-display text-lg">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl sm:text-3xl">Highly rated right now</h2>
          <Link to="/vendors" className="text-sm text-primary underline underline-offset-4">
            See all vendors
          </Link>
        </div>

        {isLoading ? (
          <LoadingState label="Loading vendors..." />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing) => (
              <VendorCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {CATEGORIES.slice(0, 4).map((category) => (
            <Link
              key={category}
              to="/vendors"
              search={{ category }}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>
          Shergud ሽር ጉድ — built for Ethiopian couples and the vendors who make their day happen.
        </p>
      </footer>
    </div>
  );
}
