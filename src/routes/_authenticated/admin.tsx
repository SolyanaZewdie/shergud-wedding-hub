import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Eyebrow } from "@/components/editorial";

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
  const { user } = useAuth();
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
            title="Access restricted"
            description="You do not have administrator permissions to view or manage vendor verifications."
            action={
              <Button asChild>
                <Link to="/">Return to home</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="grain border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
          <Eyebrow>Curation desk</Eyebrow>
          <h1 className="type-display mt-4">Vendor verification</h1>
          <p className="type-lede mt-5 max-w-2xl text-muted-foreground">
            Only approved vendors with at least one package and one portfolio image appear in the
            marketplace.
          </p>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6">
            {(["pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "type-label capitalize transition-colors",
                  s === status
                    ? "text-foreground underline decoration-primary decoration-2 underline-offset-8"
                    : "text-muted-foreground hover:text-foreground/80",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        {vendors.isLoading ? (
          <LoadingState />
        ) : vendors.isError ? (
          <ErrorState onRetry={() => vendors.refetch()} />
        ) : vendors.data && vendors.data.length ? (
          <div className="divide-y divide-border border-t border-border">
            {vendors.data.map((vendor) => {
              const offeringCount =
                (vendor as unknown as { vendor_offerings?: { count: number }[] })
                  .vendor_offerings?.[0]?.count ?? 0;
              const portfolioCount =
                (vendor as unknown as { vendor_portfolio?: { count: number }[] })
                  .vendor_portfolio?.[0]?.count ?? 0;
              return (
                <article key={vendor.id} className="py-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-display text-2xl">{vendor.business_name}</h2>
                      <p className="type-label mt-2 text-muted-foreground">
                        {vendor.category} · {vendor.location ?? "No city"} ·{" "}
                        {vendor.phone ?? "No phone"}
                      </p>
                    </div>
                    <span className="type-label rounded-full border border-border px-3 py-1 capitalize">
                      {vendor.verification_status}
                    </span>
                  </div>

                  {vendor.description ? (
                    <p className="mt-4 max-w-2xl font-serif text-lg leading-relaxed text-muted-foreground">
                      {vendor.description}
                    </p>
                  ) : null}

                  <p className="type-label mt-4 text-muted-foreground">
                    {offeringCount} package{offeringCount === 1 ? "" : "s"} · {portfolioCount}{" "}
                    portfolio image{portfolioCount === 1 ? "" : "s"}
                    {offeringCount === 0 || portfolioCount === 0
                      ? " · incomplete listing"
                      : " · ready to list"}
                  </p>
                  {vendor.rejection_reason ? (
                    <p className="mt-2 text-sm text-destructive">{vendor.rejection_reason}</p>
                  ) : null}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {status !== "approved" ? (
                      <Button
                        size="sm"
                        className="type-label"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: vendor.id, decision: "approved" })}
                      >
                        Approve
                      </Button>
                    ) : null}
                    {status !== "rejected" ? (
                      <>
                        <Input
                          className="h-9 w-full sm:w-72"
                          placeholder="Reason for rejection"
                          value={reasons[vendor.id] ?? ""}
                          onChange={(e) => setReasons({ ...reasons, [vendor.id]: e.target.value })}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="type-label"
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ id: vendor.id, decision: "rejected" })}
                        >
                          Reject
                        </Button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title={`No ${status} vendors`} />
        )}
      </div>
    </div>
  );
}

