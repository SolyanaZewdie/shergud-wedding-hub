import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type StatusFilter = "pending" | "approved" | "rejected";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Shergud Vendor Verification" },
      {
        name: "description",
        content:
          "Review, approve and reject vendor listings before they appear in the marketplace.",
      },
      { property: "og:title", content: "Admin — Shergud Vendor Verification" },
      {
        property: "og:description",
        content: "Approve or reject Shergud vendor listings from one review queue.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, view } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const isAdmin = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
    enabled: Boolean(user),
  });

  const vendors = useQuery({
    queryKey: ["admin-vendors", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*, vendor_offerings(count), vendor_portfolio(count)")
        .eq("verification_status", status)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isAdmin.data === true,
  });

  const decide = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approved" | "rejected" }) => {
      const payload =
        decision === "approved"
          ? {
              verification_status: "approved" as const,
              approved_at: new Date().toISOString(),
              approved_by: user!.id,
              rejection_reason: null,
            }
          : {
              verification_status: "rejected" as const,
              rejection_reason: reasons[id]?.trim() || "Listing needs more detail before approval.",
              approved_at: null,
              approved_by: null,
            };
      const { error } = await supabase.from("vendor_profiles").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast.success(variables.decision === "approved" ? "Vendor approved" : "Vendor rejected");
    },
    onError: () => toast.error("Couldn't update that vendor"),
  });

  if (view !== "admin") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="Admin view only"
            description="Switch the view selector to the admin view to open the review queue."
          />
        </div>
      </div>
    );
  }

  if (isAdmin.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <LoadingState />
      </div>
    );
  }

  if (isAdmin.data !== true) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="You don't have admin access"
            description="Your account isn't an administrator, so vendor decisions are blocked by the database."
            action={
              <Button asChild>
                <Link to="/vendors">Back to marketplace</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">Vendor verification</h1>

        <div className="mt-6 flex gap-2">
          {(["pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm capitalize transition-colors",
                s === status
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {vendors.isLoading ? (
            <LoadingState />
          ) : vendors.isError ? (
            <ErrorState onRetry={() => vendors.refetch()} />
          ) : vendors.data && vendors.data.length ? (
            vendors.data.map((vendor) => {
              const offeringCount =
                (vendor as unknown as { vendor_offerings?: { count: number }[] })
                  .vendor_offerings?.[0]?.count ?? 0;
              const portfolioCount =
                (vendor as unknown as { vendor_portfolio?: { count: number }[] })
                  .vendor_portfolio?.[0]?.count ?? 0;
              return (
                <div key={vendor.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl">{vendor.business_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {vendor.category} · {vendor.location ?? "No city"} ·{" "}
                        {vendor.phone ?? "No phone"}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs capitalize">
                      {vendor.verification_status}
                    </span>
                  </div>

                  {vendor.description ? (
                    <p className="mt-3 text-sm text-muted-foreground">{vendor.description}</p>
                  ) : null}

                  <p className="mt-3 text-xs text-muted-foreground">
                    {offeringCount} package{offeringCount === 1 ? "" : "s"} · {portfolioCount}{" "}
                    portfolio image{portfolioCount === 1 ? "" : "s"}
                  </p>
                  {vendor.rejection_reason ? (
                    <p className="mt-2 text-sm text-destructive">{vendor.rejection_reason}</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {status !== "approved" ? (
                      <Button
                        size="sm"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: vendor.id, decision: "approved" })}
                      >
                        Approve
                      </Button>
                    ) : null}
                    {status !== "rejected" ? (
                      <>
                        <Input
                          className="h-9 w-full sm:w-64"
                          placeholder="Reason for rejection"
                          value={reasons[vendor.id] ?? ""}
                          onChange={(e) => setReasons({ ...reasons, [vendor.id]: e.target.value })}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ id: vendor.id, decision: "rejected" })}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState title={`No ${status} vendors`} />
          )}
        </div>
      </div>
    </div>
  );
}
