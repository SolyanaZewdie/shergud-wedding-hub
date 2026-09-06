import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StoredImage } from "@/components/StoredImage";
import { SaveButton } from "@/components/SaveButton";
import { Eyebrow } from "@/components/editorial";
import { Reveal, RevealWords } from "@/components/motion";
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
      { title: "Vendor Profile — Shergud ሽር ጉድ" },
      {
        name: "description",
        content:
          "Portfolio, packages, pricing and reviews for a verified Shergud wedding vendor. Save them or start a conversation.",
      },
      { property: "og:title", content: "Vendor Profile — Shergud" },
      {
        property: "og:description",
        content: "Portfolio, packages, pricing and reviews for a verified Shergud wedding vendor.",
      },
    ],
  }),
  component: VendorProfile,
  errorComponent: ({ error }) => <ErrorState message={error.message} />,
  notFoundComponent: () => <ErrorState message="We couldn't find that vendor." />,
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
        <LoadingState variant="page" label="Loading vendor" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <ErrorState message="We couldn't load this vendor." onRetry={() => query.refetch()} />
        </div>
      </div>
    );
  }

  const { vendor, offerings, portfolio, reviews, rating, startingPrice } = query.data;
  const cover = portfolio[0]?.image_url ?? null;
  const rest = portfolio.slice(1);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ---------- Editorial cover ---------- */}
      <section className="relative">
        <div className="relative h-[68svh] min-h-[420px] w-full overflow-hidden bg-parchment">
          <StoredImage
            path={cover}
            alt={`Work by ${vendor.business_name}`}
            eager
            className="scale-[1.02]"
          />
          <div className="scrim-bottom absolute inset-0" aria-hidden />
          <div className="grain pointer-events-none absolute inset-0" aria-hidden />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1500px] px-5 pb-8 sm:px-8 sm:pb-12">
            <p className="type-label text-espresso-foreground/80">{vendor.category}</p>
            <h1 className="type-display mt-4 max-w-3xl text-espresso-foreground">
              <RevealWords text={vendor.business_name} />
            </h1>
          </div>
        </div>

        <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
          <Link
            to="/vendors"
            search={{ sort: "rating" }}
            className="link-arrow type-label mt-6 inline-flex text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to the directory
          </Link>
        </div>
      </section>

      {/* ---------- Meta strip ---------- */}
      <section className="mx-auto mt-8 max-w-[1500px] px-5 sm:px-8">
        <dl className="grid gap-8 border-y border-border py-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="type-label text-muted-foreground">Where</dt>
            <dd className="font-display mt-2 text-2xl">{vendor.location ?? "Ethiopia"}</dd>
          </div>
          <div>
            <dt className="type-label text-muted-foreground">Rating</dt>
            <dd className="font-display mt-2 flex items-center gap-2 text-2xl">
              <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
              {rating ?? "New"}
              {reviews.length ? (
                <span className="text-base text-muted-foreground">
                  {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt className="type-label text-muted-foreground">Starting from</dt>
            <dd className="font-display mt-2 text-2xl">{formatBirr(startingPrice)}</dd>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            {user && view === "couple" ? (
              <SaveButton
                variant="inline"
                saved={saved}
                pending={save.isPending}
                onToggle={() => save.mutate()}
              />
            ) : null}
            {vendor.phone ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {vendor.phone}
              </p>
            ) : null}
          </div>
        </dl>
      </section>

      {/* ---------- Story + packages ---------- */}
      <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.3fr_1fr] lg:gap-24">
          <div>
            {vendor.description ? (
              <Reveal>
                <Eyebrow>About</Eyebrow>
                <p className="font-display mt-6 text-2xl leading-[1.28] text-pretty sm:text-3xl">
                  {vendor.description}
                </p>
              </Reveal>
            ) : null}

            <Reveal className="mt-16">
              <Eyebrow>Packages</Eyebrow>
              {offerings.length ? (
                <ul className="mt-6 border-t border-border">
                  {offerings.map((offering) => (
                    <li
                      key={offering.id}
                      className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border py-6"
                    >
                      <div className="max-w-md">
                        <h3 className="type-title">{offering.name}</h3>
                        {offering.description ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {offering.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="font-display text-2xl">{formatBirr(Number(offering.price))}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-muted-foreground">
                  This vendor hasn&apos;t published packages yet — message them for a quote.
                </p>
              )}
            </Reveal>

            {reviews.length ? (
              <Reveal className="mt-16">
                <Eyebrow>What couples said</Eyebrow>
                <ul className="mt-6 grid gap-8 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <li key={review.id} className="border-t border-border pt-5">
                      <p className="flex items-center gap-1.5 text-sm">
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden />
                        {review.rating}
                      </p>
                      {review.comment ? (
                        <p className="font-display mt-3 text-xl leading-snug">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>

          {/* Contact panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-border bg-card p-6 sm:p-8">
              <h2 className="type-title">Talk to {vendor.business_name}</h2>
              {user && view === "couple" ? (
                <form
                  className="mt-5 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    contact.mutate();
                  }}
                >
                  <Textarea
                    aria-label="Your message"
                    rows={5}
                    className="rounded-none"
                    placeholder="Hi! We're getting married in December in Addis — are you free?"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <Button
                    type="submit"
                    className="type-label h-12 w-full rounded-none"
                    disabled={contact.isPending || !draft.trim()}
                  >
                    {contact.isPending ? "Sending..." : "Send message"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your conversation is saved to your account, so you can pick it up any time.
                  </p>
                </form>
              ) : (
                <>
                  <p className="mt-4 text-muted-foreground">
                    Create a couple account to message vendors and keep a shortlist.
                  </p>
                  <Button asChild className="type-label mt-6 h-12 w-full rounded-none">
                    <Link to="/auth" search={{ mode: "signup" }}>
                      Start planning
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Portfolio gallery ---------- */}
      {rest.length ? (
        <section className="border-t border-border bg-parchment/50 py-20 sm:py-24">
          <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
            <Eyebrow>Portfolio</Eyebrow>
            <h2 className="type-headline mt-5 max-w-xl">Their work, at full size.</h2>

            <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
              {rest.map((item, i) => (
                <Reveal key={item.id} variant="zoom" delay={(i % 3) * 80} className="block">
                  <div className="w-full overflow-hidden bg-parchment">
                    <StoredImage
                      path={item.image_url}
                      alt={item.title ?? `${vendor.business_name} work sample`}
                      className={i % 3 === 1 ? "aspect-3/4" : "aspect-4/5"}
                    />
                  </div>
                  {item.title ? (
                    <p className="type-label mt-3 text-muted-foreground">{item.title}</p>
                  ) : null}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter />
    </div>
  );
}
