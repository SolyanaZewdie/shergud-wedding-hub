import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { VendorCard } from "@/components/VendorCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toggleSavedVendor, type Listing } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "Saved Vendors — Shergud" },
      {
        name: "description",
        content: "Your shortlist of favourite Ethiopian wedding vendors, saved for later.",
      },
      { property: "og:title", content: "Saved Vendors — Shergud" },
      { property: "og:description", content: "The wedding vendors you shortlisted on Shergud." },
    ],
  }),
  component: SavedVendors,
});

function SavedVendors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["saved-list", user?.id],
    queryFn: async () => {
      const saved = await supabase
        .from("saved_vendors")
        .select("vendor_id")
        .eq("couple_id", user!.id);
      if (saved.error) throw saved.error;
      const ids = (saved.data ?? []).map((r) => r.vendor_id);
      if (!ids.length) return [] as Listing[];
      const listings = await supabase.from("vendor_public_listing").select("*").in("id", ids);
      if (listings.error) throw listings.error;
      return (listings.data ?? []) as Listing[];
    },
    enabled: Boolean(user),
  });

  const remove = useMutation({
    mutationFn: (vendorId: string) => toggleSavedVendor(user!.id, vendorId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-list"] });
      queryClient.invalidateQueries({ queryKey: ["saved"] });
      toast.success("Removed from your shortlist");
    },
  });

  const count = query.data?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="grain border-b border-border bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between lg:py-16">
          <div>
            <Eyebrow>Kept for later</Eyebrow>
            <h1 className="type-display mt-4">Your shortlist</h1>
          </div>
          <p className="type-label text-muted-foreground">
            {count === 0 ? "No vendors yet" : `${count} vendor${count === 1 ? "" : "s"} saved`}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : query.data && query.data.length ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {query.data.map((listing) => (
              <VendorCard
                key={listing.id}
                listing={listing}
                saved
                onToggleSave={() => remove.mutate(listing.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing saved yet"
            description="Tap the heart on any vendor to keep them here."
            action={
              <Button asChild>
                <Link to="/vendors">Browse vendors</Link>
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}

