import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MapPin, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { StoredImage } from "@/components/StoredImage";
import { ErrorState, LoadingState } from "@/components/state-blocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchSavedVendorIds,
  fetchVendor,
  formatBirr,
  getOrCreateConversation,
  sendMessage,
  toggleSavedVendor,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/vendors/$vendorId")({
  head: () => ({
    meta: [
      { title: "Vendor profile — Shergud" },
      {
        name: "description",
        content:
          "See packages, pricing, portfolio work and reviews for this verified Shergud wedding vendor.",
      },
      { property: "og:title", content: "Vendor profile — Shergud" },
      {
        property: "og:description",
        content: "Packages, pricing, portfolio and reviews for a verified Shergud wedding vendor.",
      },
    ],
  }),
  component: VendorProfile,
  errorComponent: ({ error }) => <ErrorState message={error.message} />,
  notFoundComponent: () => <ErrorState message="Vendor not found." />,
});

function VendorProfile() {
  const { vendorId } = Route.useParams();
  const { user, view } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

  const query = useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: () => fetchVendor(vendorId),
  });

  const savedIds = useQuery({
    queryKey: ["saved", user?.id],
    queryFn: () => fetchSavedVendorIds(user!.id),
    enabled: Boolean(user && view === "couple"),
  });

  const saved = savedIds.data?.includes(vendorId) ?? false;

  const save = useMutation({
    mutationFn: () => toggleSavedVendor(user!.id, vendorId, saved),
    onSuccess: (nowSaved) => {
      queryClient.invalidateQueries({ queryKey: ["saved"] });
      toast.success(nowSaved ? "Saved to your shortlist" : "Removed from your shortlist");
    },
    onError: () => toast.error("Couldn't update your shortlist"),
  });

  const contact = useMutation({
    mutationFn: async () => {
      const conversationId = await getOrCreateConversation(user!.id, vendorId);
      await sendMessage(conversationId, user!.id, draft.trim());
      return conversationId;
    },
    onSuccess: (conversationId) => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Message sent");
      navigate({ to: "/messages", search: { conversation: conversationId } });
    },
    onError: () => toast.error("Couldn't send your message"),
  });

  if (query.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <LoadingState label="Loading vendor..." />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState message="We couldn't load this vendor." onRetry={() => query.refetch()} />
        </div>
      </div>
    );
  }

  const { vendor, offerings, portfolio, reviews, rating, startingPrice } = query.data;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/vendors" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to marketplace
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
              {vendor.category}
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl">{vendor.business_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {vendor.location ?? "Ethiopia"}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {rating ?? "New"} {reviews.length ? `(${reviews.length} reviews)` : ""}
              </span>
              {vendor.phone ? (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {vendor.phone}
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="font-display text-2xl">{formatBirr(startingPrice)}</p>
            {user && view === "couple" ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => save.mutate()}
                disabled={save.isPending}
              >
                <Heart className={saved ? "fill-primary text-primary" : ""} />
                {saved ? "Saved" : "Save vendor"}
              </Button>
            ) : null}
          </div>
        </div>

        {vendor.description ? (
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            {vendor.description}
          </p>
        ) : null}

        <section className="mt-12">
          <h2 className="text-2xl">Portfolio</h2>
          {portfolio.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((item) => (
                <StoredImage
                  key={item.id}
                  path={item.image_url}
                  alt={item.title ?? `${vendor.business_name} work sample`}
                  className="h-52 w-full rounded-lg"
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No portfolio images yet.</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl">Packages</h2>
          {offerings.length ? (
            <div className="mt-4 space-y-3">
              {offerings.map((offering) => (
                <div
                  key={offering.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <div>
                    <h3 className="font-medium">{offering.name}</h3>
                    {offering.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{offering.description}</p>
                    ) : null}
                  </div>
                  <p className="font-display text-lg">{formatBirr(Number(offering.price))}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No packages listed yet.</p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl">Reviews</h2>
          {reviews.length ? (
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{review.author_name}</p>
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" /> {review.rating}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  ) : null}
                  {review.is_sample ? (
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Sample review
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </section>

        <section className="mt-12 rounded-xl border border-border bg-card p-5">
          <h2 className="text-2xl">Contact {vendor.business_name}</h2>
          {user && view === "couple" ? (
            <>
              <Textarea
                className="mt-4"
                rows={4}
                placeholder="Tell them your wedding date, location and what you need..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button
                className="mt-3"
                disabled={!draft.trim() || contact.isPending}
                onClick={() => contact.mutate()}
              >
                {contact.isPending ? "Sending..." : "Send message"}
              </Button>
            </>
          ) : user ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Switch to the couple view to message vendors.
            </p>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">
                Sign in as a couple to message this vendor and save them to your shortlist.
              </p>
              <Button className="mt-3" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Sign in to message
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
