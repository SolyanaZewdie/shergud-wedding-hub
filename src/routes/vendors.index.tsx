import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { VendorCard } from "@/components/VendorCard";
import { Eyebrow } from "@/components/editorial";
import { Reveal } from "@/components/motion";
import { EmptyState, ErrorState, VendorSkeletonGrid } from "@/components/state-blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  fetchListings,
  fetchSavedVendorIds,
  toggleSavedVendor,
  type SortKey,
} from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Search = {
  category?: string | undefined;
  location?: string | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  sort?: SortKey | undefined;
  q?: string | undefined;
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: "rating", label: "Recommended" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
  { value: "newest", label: "Newest" },
  { value: "relevance", label: "A–Z" },
];

const LOCATIONS = ["Addis Ababa", "Bahir Dar", "Hawassa", "Adama", "Mekelle", "Gondar"];

export const Route = createFileRoute("/vendors/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
    location: typeof search["location"] === "string" ? (search["location"] as string) : undefined,
    maxPrice: search["maxPrice"] ? Number(search["maxPrice"]) : undefined,
    minRating: search["minRating"] ? Number(search["minRating"]) : undefined,
    sort: (SORTS.find((s) => s.value === search["sort"])?.value ?? "rating") as SortKey,
    q: typeof search["q"] === "string" ? (search["q"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "The Vendor Directory — Shergud ሽር ጉድ" },
      {
        name: "description",
        content:
          "Browse verified Ethiopian wedding vendors by category, city, price and rating — photographers, venues, caterers, decorators, musicians.",
      },
      { property: "og:title", content: "The Vendor Directory — Shergud" },
      {
        property: "og:description",
        content: "Verified Ethiopian wedding vendors, filtered by category, city, price and rating.",
      },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { user, view } = useAuth();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filters = {
    category: search.category,
    location: search.location,
    maxPrice: search.maxPrice,
    minRating: search.minRating,
    sort: search.sort ?? ("rating" as SortKey),
    search: search.q,
  };

  const listings = useQuery({
    queryKey: ["listings", filters],
    queryFn: () => fetchListings(filters),
  });

  const savedIds = useQuery({
    queryKey: ["saved", user?.id],
    queryFn: () => fetchSavedVendorIds(user!.id),
    enabled: Boolean(user && view === "couple"),
  });

  const save = useMutation({
    mutationFn: ({ vendorId, saved }: { vendorId: string; saved: boolean }) =>
      toggleSavedVendor(user!.id, vendorId, saved),
    onSuccess: (nowSaved) => {
      queryClient.invalidateQueries({ queryKey: ["saved"] });
      toast.success(nowSaved ? "Saved to your shortlist" : "Removed from your shortlist");
    },
    onError: () => toast.error("Couldn't update your shortlist"),
  });

  function update(patch: Partial<Search>) {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  const activeCount = [
    search.location,
    search.maxPrice,
    search.minRating,
    search.q,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Directory masthead */}
      <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-8 sm:px-8 sm:pb-14 sm:pt-12">
        <Reveal>
          <Eyebrow>The directory</Eyebrow>
          <h1 className="type-display mt-5 max-w-3xl text-balance">
            {search.category ? (
              <>
                {search.category}
                <span className="text-muted-foreground"> in Ethiopia</span>
              </>
            ) : (
              <>
                Find the people who make
                <span className="text-muted-foreground"> weddings feel like weddings.</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-lg text-muted-foreground">
            Only vendors we have reviewed, with published work and real prices, appear here.
          </p>
        </Reveal>
      </section>

      {/* Sticky filter rail */}
      <div className="sticky top-[62px] z-30 border-y border-border bg-background/94 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 sm:px-8">
          <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1">
            <FilterPill
              active={!search.category}
              onClick={() => update({ category: undefined })}
              label="All"
            />
            {CATEGORIES.map((c) => (
              <FilterPill
                key={c}
                active={search.category === c}
                onClick={() => update({ category: search.category === c ? undefined : c })}
                label={c}
              />
            ))}
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="type-label flex shrink-0 cursor-pointer items-center gap-2 border border-border px-4 py-2.5 transition-colors hover:border-primary hover:text-primary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Filters
            {activeCount ? <span className="text-primary">({activeCount})</span> : null}
          </button>

          <Select value={filters.sort} onValueChange={(v) => update({ sort: v as SortKey })}>
            <SelectTrigger
              className="type-label hidden h-[42px] w-[168px] shrink-0 rounded-none border-border sm:flex"
              aria-label="Sort vendors"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter drawer (bottom sheet on mobile, side panel on desktop) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="bottom" className="max-h-[88svh] overflow-y-auto sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle className="type-title">Refine</SheetTitle>
          </SheetHeader>

          <div className="mx-auto grid w-full max-w-md gap-6 px-4 pb-8 sm:px-0">
            <div className="space-y-2">
              <Label htmlFor="q" className="type-label text-muted-foreground">
                Search by name
              </Label>
              <Input
                id="q"
                placeholder="Selam Studios"
                className="h-11 rounded-none"
                value={search.q ?? ""}
                onChange={(e) => update({ q: e.target.value || undefined })}
              />
            </div>

            <div className="space-y-2">
              <span className="type-label text-muted-foreground">City</span>
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={!search.location}
                  onClick={() => update({ location: undefined })}
                  label="Anywhere"
                />
                {LOCATIONS.map((c) => (
                  <FilterPill
                    key={c}
                    active={search.location === c}
                    onClick={() => update({ location: search.location === c ? undefined : c })}
                    label={c}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice" className="type-label text-muted-foreground">
                Max starting price (ETB)
              </Label>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                step={1000}
                placeholder="Any"
                className="h-11 rounded-none"
                value={search.maxPrice ?? ""}
                onChange={(e) =>
                  update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>

            <div className="space-y-2">
              <span className="type-label text-muted-foreground">Minimum rating</span>
              <div className="flex flex-wrap gap-2">
                {[4.5, 4, 3].map((r) => (
                  <FilterPill
                    key={r}
                    active={search.minRating === r}
                    onClick={() => update({ minRating: search.minRating === r ? undefined : r })}
                    label={`${r}+`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 sm:hidden">
              <span className="type-label text-muted-foreground">Sort</span>
              <Select value={filters.sort} onValueChange={(v) => update({ sort: v as SortKey })}>
                <SelectTrigger className="h-11 rounded-none" aria-label="Sort vendors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                className="type-label h-12 flex-1 rounded-none"
                onClick={() => setDrawerOpen(false)}
              >
                Show results
              </Button>
              <button
                onClick={() => navigate({ search: { sort: "rating" } })}
                className="type-label flex cursor-pointer items-center gap-1.5 px-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Results */}
      <section className="mx-auto max-w-[1500px] px-5 py-12 sm:px-8 sm:py-16">
        {listings.isLoading ? (
          <VendorSkeletonGrid />
        ) : listings.isError ? (
          <ErrorState
            message="We couldn't load the directory right now."
            onRetry={() => listings.refetch()}
          />
        ) : listings.data && listings.data.length > 0 ? (
          <>
            <p className="type-label mb-10 text-muted-foreground">
              {listings.data.length} vendor{listings.data.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
              {listings.data.map((listing, i) => {
                const saved = savedIds.data?.includes(listing.id) ?? false;
                return (
                  <Reveal key={listing.id} delay={(i % 3) * 90}>
                    <VendorCard
                      listing={listing}
                      index={i}
                      saved={saved}
                      onToggleSave={
                        user && view === "couple"
                          ? () => save.mutate({ vendorId: listing.id, saved })
                          : undefined
                      }
                    />
                  </Reveal>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title="Nobody here — yet."
            description="Nothing matches those filters. Try a wider price range, another city, or clear everything and start again."
            action={
              <button
                onClick={() => navigate({ search: { sort: "rating" } })}
                className="type-label cursor-pointer border-b border-foreground/30 pb-1.5 transition-colors hover:border-primary hover:text-primary"
              >
                Clear all filters
              </button>
            }
          />
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "type-label shrink-0 cursor-pointer border px-4 py-2.5 transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
