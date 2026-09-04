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
      const saved = await supabase.from("saved_vendors").select("vendor_id").eq("couple_id", user!.id);
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

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">Your shortlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vendors you saved while browsing.</p>

        <div className="mt-8">
          {query.isLoading ? (
            <LoadingState />
          ) : query.isError ? (
            <ErrorState onRetry={() => query.refetch()} />
          ) : query.data && query.data.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
