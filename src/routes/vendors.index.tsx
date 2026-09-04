import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { VendorCard } from "@/components/VendorCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

type Search = {
  category?: string | undefined;
  location?: string | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  sort?: SortKey | undefined;
  q?: string | undefined;
};

const SORTS: { value: SortKey; label: string }[] = [
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
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
      { title: "Browse Wedding Vendors — Shergud Marketplace" },
      {
        name: "description",
        content:
          "Filter verified Ethiopian wedding vendors by category, city, price and rating. Photographers, venues, caterers and decorators in one place.",
      },
      { property: "og:title", content: "Browse Wedding Vendors — Shergud" },
      {
        property: "og:description",
        content: "Search verified Ethiopian wedding vendors by category, city, price and rating.",
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

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">Wedding vendors</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Only approved vendors with published work appear here.
        </p>

        <div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              placeholder="Business name"
              value={search.q ?? ""}
              onChange={(e) => update({ q: e.target.value || undefined })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={search.category ?? "all"}
              onValueChange={(v) => update({ category: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>City</Label>
            <Select
              value={search.location ?? "all"}
              onValueChange={(v) => update({ location: v === "all" ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Anywhere</SelectItem>
                {LOCATIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maxPrice">Max starting price (ETB)</Label>
            <Input
              id="maxPrice"
              type="number"
              min={0}
              step={1000}
              placeholder="Any"
              value={search.maxPrice ?? ""}
              onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Sort by</Label>
            <Select value={filters.sort} onValueChange={(v) => update({ sort: v as SortKey })}>
              <SelectTrigger>
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

          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-5">
            <span className="text-sm text-muted-foreground">Minimum rating:</span>
            {[4.5, 4, 3].map((r) => (
              <button
                key={r}
                onClick={() => update({ minRating: search.minRating === r ? undefined : r })}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  search.minRating === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {r}+
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() =>
                navigate({
                  search: { sort: "rating" },
                })
              }
            >
              Clear filters
            </Button>
          </div>
        </div>

        <div className="mt-8">
          {listings.isLoading ? (
            <LoadingState label="Finding vendors..." />
          ) : listings.isError ? (
            <ErrorState onRetry={() => listings.refetch()} />
          ) : listings.data && listings.data.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                {listings.data.length} vendor{listings.data.length === 1 ? "" : "s"} found
              </p>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {listings.data.map((listing) => {
                  const saved = savedIds.data?.includes(listing.id) ?? false;
                  return (
                    <VendorCard
                      key={listing.id}
                      listing={listing}
                      saved={saved}
                      onToggleSave={
                        user && view === "couple"
                          ? () => save.mutate({ vendorId: listing.id, saved })
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <EmptyState
              title="No vendors match those filters"
              description="Try widening your price range or clearing a filter."
            />
          )}
        </div>
      </div>
    </div>
  );
}
