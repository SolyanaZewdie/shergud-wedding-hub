import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VendorCard } from "@/components/VendorCard";
import { CategoryExplorer } from "@/components/CategoryExplorer";
import { VendorSkeletonGrid } from "@/components/state-blocks";
import { ArrowLink, DarkBand, Eyebrow, SectionHeading, StatLine } from "@/components/editorial";
import { Reveal, RevealWords, useParallax } from "@/components/motion";
import { fetchListings } from "@/lib/data";
import { useAuth } from "@/lib/auth";

import heroCouple from "@/assets/hero-couple.jpg";
import bandImage from "@/assets/cat-music.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shergud ሽር ጉድ — Ethiopian Wedding Vendors, Beautifully Vetted" },
      {
        name: "description",
        content:
          "Shergud is the Ethiopian wedding marketplace: verified photographers, venues, caterers, decorators and musicians. Save favourites, message vendors, plan your day.",
      },
      { property: "og:title", content: "Shergud ሽር ጉድ — Ethiopian Wedding Vendors" },
      {
        property: "og:description",
        content:
          "An editorial marketplace connecting Ethiopian couples with verified wedding vendors across Addis Ababa and beyond.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  {
    n: "01",
    title: "Tell us about the day",
    body: "Your date, your city, how many people you are imagining, what it should feel like.",
  },
  {
    n: "02",
    title: "Meet the shortlist",
    body: "Browse verified vendors with real portfolios and real starting prices. Save the ones you love.",
  },
  {
    n: "03",
    title: "Talk it through",
    body: "Message vendors directly inside Shergud. Every conversation stays saved to your account.",
  },
];

function Home() {
  const { user, view } = useAuth();
  const parallax = useParallax(0.09);

  const { data, isLoading } = useQuery({
    queryKey: ["listings", { sort: "rating" }],
    queryFn: () => fetchListings({ sort: "rating" }),
  });

  const featured = (data ?? []).slice(0, 6);
  const dashboardTo = view === "vendor" ? "/vendor" : view === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ---------- 1. Cinematic hero ---------- */}
      <section className="relative border-b border-border">
        <div className="mx-auto grid max-w-[1500px] items-stretch gap-0 md:grid-cols-[1fr_0.95fr]">
          <div className="flex flex-col justify-center px-5 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-16 md:min-h-[86svh] md:pr-14">
            <Reveal>
              <p className="font-ethiopic text-lg text-primary">ሽር ጉድ</p>
            </Reveal>

            <h1 className="type-display mt-6">
              <span className="block">
                <RevealWords text="Weddings," />
              </span>
              <span className="block text-muted-foreground">
                <RevealWords text="but make them" />
              </span>
              <span className="block italic">
                <RevealWords text="yours." />
              </span>
            </h1>

            <Reveal delay={220} className="mt-9 max-w-md">
              <p className="type-lede text-muted-foreground text-pretty">
                The people who make an Ethiopian wedding feel like one — photographers, venues,
                caterers, florists, musicians — gathered, verified, and ready to talk.
              </p>
            </Reveal>

            <Reveal delay={320} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                to="/vendors"
                search={{ sort: "rating" }}
                className="link-arrow type-label bg-primary px-7 py-4 text-primary-foreground transition-colors hover:bg-espresso"
              >
                Explore vendors
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
              {user ? (
                <ArrowLink to={dashboardTo}>Go to my space</ArrowLink>
              ) : (
                <ArrowLink to="/auth" search={{ mode: "signup" }}>
                  I&apos;m planning my wedding
                </ArrowLink>
              )}
            </Reveal>

            <Reveal delay={420} className="mt-14 hidden items-center gap-4 md:flex">
              <span className="h-px w-16 bg-border" aria-hidden />
              <p className="type-label text-muted-foreground">Scroll</p>
            </Reveal>
          </div>

          <div className="relative overflow-hidden bg-parchment md:min-h-[86svh]">
            <div ref={parallax} className="h-full w-full will-change-transform">
              <img
                src={heroCouple}
                alt="An Ethiopian bride and groom in traditional habesha dress at golden hour above Addis Ababa"
                width={1280}
                height={1920}
                className="h-[62vh] w-full object-cover object-center md:h-[calc(86svh+8rem)] md:-mt-16"
              />
            </div>
            <div className="grain pointer-events-none absolute inset-0" aria-hidden />
            <p className="type-label absolute bottom-5 left-5 text-espresso-foreground/85 mix-blend-difference">
              Entoto, Addis Ababa
            </p>
          </div>
        </div>
      </section>

      {/* ---------- 2. Manifesto + numbers ---------- */}
      <DarkBand>
        <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:gap-20">
            <div>
              <Eyebrow className="text-current/50">Why Shergud exists</Eyebrow>
              <p className="font-display mt-7 text-3xl leading-[1.12] text-balance sm:text-4xl lg:text-5xl">
                <RevealWords text="Ethiopian weddings are built on trust — a cousin's friend, a name passed down at a coffee ceremony. Shergud keeps that instinct and gives it proof." />
              </p>
              <div className="mt-12">
                <ArrowLink to="/vendors" search={{ sort: "rating" }} className="text-current hover:text-accent">
                  Browse the directory
                </ArrowLink>
              </div>
            </div>

            <Reveal variant="zoom" className="relative aspect-4/5 w-full self-end lg:aspect-3/4">
              <img
                src={bandImage}
                alt="Guests dancing eskista under string lights at an Ethiopian wedding"
                loading="lazy"
                width={1280}
                height={1600}
                className="h-full w-full object-cover"
              />
            </Reveal>
          </div>

          <StatLine
            className="mt-20 border-t border-current/15 pt-12"
            items={[
              { value: "Vetted", label: "Every listing reviewed" },
              { value: "ETB", label: "Real starting prices" },
              { value: "1:1", label: "Message vendors direct" },
              { value: "ሽር ጉድ", label: "Built for Ethiopia" },
            ]}
          />
        </div>
      </DarkBand>

      {/* ---------- 3. Category discovery ---------- */}
      <section id="discover" className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading
          eyebrow="Discover"
          title={
            <>
              Everything your day needs,
              <br className="hidden sm:block" /> and nobody it doesn&apos;t.
            </>
          }
          aside={<ArrowLink to="/vendors" search={{ sort: "rating" }}>All categories</ArrowLink>}
        />
        <div className="mt-16">
          <CategoryExplorer />
        </div>
      </section>

      {/* ---------- 4. Featured vendors — horizontal editorial rail ---------- */}
      <section className="border-y border-border bg-parchment/60 py-24 sm:py-32">
        <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
          <SectionHeading
            eyebrow="Highly rated right now"
            title="The names couples keep coming back to"
            aside={<ArrowLink to="/vendors" search={{ sort: "rating" }}>See all vendors</ArrowLink>}
          />
        </div>

        <div className="mt-14">
          {isLoading ? (
            <div className="mx-auto max-w-[1500px] px-5 sm:px-8">
              <VendorSkeletonGrid count={3} />
            </div>
          ) : featured.length ? (
            <ul className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:gap-8 sm:px-8">
              {featured.map((listing, i) => (
                <li
                  key={listing.id}
                  className="min-w-[80%] shrink-0 snap-start sm:min-w-[44%] lg:min-w-[30%]"
                >
                  <VendorCard listing={listing} index={i} />
                </li>
              ))}
              <li aria-hidden className="min-w-1 shrink-0" />
            </ul>
          ) : (
            <div className="mx-auto max-w-xl px-5 text-center sm:px-8">
              <p className="type-lede text-muted-foreground">
                The first vendors are being reviewed right now. Check back very soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ---------- 5. How it works ---------- */}
      <section id="how" className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 sm:py-32">
        <SectionHeading eyebrow="How it works" title="Three steps, no group chats" />
        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 110} className="border-t border-foreground/15 pt-6">
              <p className="font-display text-5xl text-accent">{step.n}</p>
              <h3 className="type-title mt-5">{step.title}</h3>
              <p className="mt-3 text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-20 flex flex-col gap-6 border-t border-foreground/15 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-display max-w-xl text-3xl leading-tight sm:text-4xl">
            Are you the one making the weddings happen?
          </p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="link-arrow type-label self-start border-b border-foreground/30 pb-1.5 transition-colors hover:border-primary hover:text-primary sm:self-auto"
          >
            List your business
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
