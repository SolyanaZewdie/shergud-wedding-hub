import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { StoredImage } from "@/components/StoredImage";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, PORTFOLIO_BUCKET, formatBirr } from "@/lib/data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/vendor")({
  head: () => ({
    meta: [
      { title: "Vendor Studio — Shergud" },
      {
        name: "description",
        content:
          "Manage your Shergud vendor listing: business details, packages, portfolio images and verification status.",
      },
      { property: "og:title", content: "Vendor Studio — Shergud" },
      {
        property: "og:description",
        content: "Manage your business details, packages and portfolio on Shergud.",
      },
    ],
  }),
  component: VendorStudio;
});

function VendorStudio() {
  const { user, view } = useAuth();
  const queryClient = useQueryClient();

  const data = useQuery({
    queryKey: ["my-vendor", user?.id],
    queryFn: async () => {
      const vendor = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (vendor.error) throw vendor.error;
      if (!vendor.data) return { vendor: null, offerings: [], portfolio: [] };
      const [offerings, portfolio] = await Promise.all([
        supabase.from("vendor_offerings").select("*").eq("vendor_id", vendor.data.id),
        supabase.from("vendor_portfolio").select("*").eq("vendor_id", vendor.data.id),
      ]);
      return {
        vendor: vendor.data,
        offerings: offerings.data ?? [],
        portfolio: portfolio.data ?? [],
      };
    },
    enabled: Boolean(user),
  });

  const vendor = data.data?.vendor ?? null;

  const [details, setDetails] = useState({
    business_name: "",
    category: "Photography",
    location: "",
    phone: "",
    description: "",
  });
  const [offering, setOffering] = useState({ name: "", price: "", description: "" });

  const saveDetails = useMutation({
    mutationFn: async () => {
      const payload = {
        business_name: details.business_name || vendor?.business_name || "",
        category: details.category || vendor?.category || "Photography",
        location: details.location || vendor?.location || null,
        phone: details.phone || vendor?.phone || null,
        description: details.description || vendor?.description || null,
      };
      if (!payload.business_name) throw new Error("Business name is required");
      if (vendor) {
        const { error } = await supabase
          .from("vendor_profiles")
          .update(payload)
          .eq("id", vendor.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("vendor_profiles")
          .insert({ ...payload, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vendor"] });
      toast.success("Business details saved");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't save"),
  });

  const addOffering = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vendor_offerings").insert({
        vendor_id: vendor!.id,
        name: offering.name,
        price: Number(offering.price || 0),
        description: offering.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOffering({ name: "", price: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["my-vendor"] });
      toast.success("Package added");
    },
    onError: () => toast.error("Couldn't add that package"),
  });

  const deleteOffering = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vendor_offerings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-vendor"] }),
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      const path = `${user!.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const upload = await supabase.storage.from(PORTFOLIO_BUCKET).upload(path, file);
      if (upload.error) throw upload.error;
      const { error } = await supabase
        .from("vendor_portfolio")
        .insert({ vendor_id: vendor!.id, image_url: path, title: file.name });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-vendor"] });
      toast.success("Image uploaded");
    },
    onError: () => toast.error("Upload failed. Images must be under 10 MB."),
  });

  const deleteImage = useMutation({
    mutationFn: async ({ id, path }: { id: string; path: string }) => {
      const { error } = await supabase.from("vendor_portfolio").delete().eq("id", id);
      if (error) throw error;
      if (!/^https?:\/\//.test(path)) {
        await supabase.storage.from(PORTFOLIO_BUCKET).remove([path]);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-vendor"] }),
  });

  if (view !== "vendor") {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState
            title="This area is for vendors"
            description="Switch the view selector to the vendor view to manage a business listing."
          />
        </div>
      </div>
    );
  }

  if (data.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <LoadingState />
      </div>
    );
  }

  if (data.isError) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState onRetry={() => data.refetch()} />
        </div>
      </div>
    );
  }

  const status = vendor?.verification_status ?? null;
  const offerings = data.data?.offerings ?? [];
  const portfolio = data.data?.portfolio ?? [];
  const readyToList = status === "approved" && offerings.length > 0 && portfolio.length > 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">Vendor studio</h1>

        {status ? (
          <div className="mt-5 rounded-lg border border-border bg-card p-4 text-sm">
            <p>
              Verification status:{" "}
              <strong className="capitalize">{status}</strong>
            </p>
            {status === "pending" ? (
              <p className="mt-1 text-muted-foreground">
                Our team is reviewing your listing. You can keep editing while you wait.
              </p>
            ) : null}
            {status === "rejected" ? (
              <p className="mt-1 text-muted-foreground">
                {vendor?.rejection_reason ?? "Your listing needs changes before it can go live."}
              </p>
            ) : null}
            {status === "approved" ? (
              <p className="mt-1 text-muted-foreground">
                {readyToList
                  ? "You are live in the marketplace."
                  : "Approved — add at least one package and one portfolio image to appear in search."}
              </p>
            ) : null}
            {readyToList && vendor ? (
              <Link
                to="/vendors/$vendorId"
                params={{ vendorId: vendor.id }}
                className="mt-2 inline-block text-primary underline underline-offset-4"
              >
                View my public profile
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Create your business listing below. It goes to our team for approval.
          </p>
        )}

        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <h2 className="text-2xl">Business details</h2>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveDetails.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="business_name">Business name</Label>
              <Input
                id="business_name"
                defaultValue={vendor?.business_name ?? ""}
                onChange={(e) => setDetails({ ...details, business_name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  defaultValue={vendor?.category ?? "Photography"}
                  onValueChange={(v) => setDetails({ ...details, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">City</Label>
                <Input
                  id="location"
                  defaultValue={vendor?.location ?? ""}
                  onChange={(e) => setDetails({ ...details, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                defaultValue={vendor?.phone ?? ""}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">About your work</Label>
              <Textarea
                id="description"
                rows={4}
                defaultValue={vendor?.description ?? ""}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={saveDetails.isPending}>
              {saveDetails.isPending ? "Saving..." : vendor ? "Save changes" : "Create listing"}
            </Button>
          </form>
        </section>

        {vendor ? (
          <>
            <section className="mt-8 rounded-xl border border-border bg-card p-5">
              <h2 className="text-2xl">Packages</h2>
              <div className="mt-4 space-y-2">
                {offerings.length ? (
                  offerings.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{o.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatBirr(Number(o.price))}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete package"
                        onClick={() => deleteOffering.mutate(o.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No packages yet.</p>
                )}
              </div>

              <form
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_140px_auto]"
                onSubmit={(e) => {
                  e.preventDefault();
                  addOffering.mutate();
                }}
              >
                <Input
                  placeholder="Package name"
                  value={offering.name}
                  onChange={(e) => setOffering({ ...offering, name: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Price (ETB)"
                  value={offering.price}
                  onChange={(e) => setOffering({ ...offering, price: e.target.value })}
                  required
                />
                <Button type="submit" disabled={addOffering.isPending}>
                  Add
                </Button>
              </form>
            </section>

            <section className="mt-8 rounded-xl border border-border bg-card p-5">
              <h2 className="text-2xl">Portfolio</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {portfolio.map((item) => (
                  <div key={item.id} className="relative">
                    <StoredImage
                      path={item.image_url}
                      alt={item.title ?? "Portfolio image"}
                      className="h-40 w-full rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Delete image"
                      className="absolute right-2 top-2"
                      onClick={() => deleteImage.mutate({ id: item.id, path: item.image_url })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="upload">Add an image (max 10 MB)</Label>
                <Input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="mt-1.5"
                  disabled={uploadImage.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage.mutate(file);
                    e.target.value = "";
                  }}
                />
                {uploadImage.isPending ? (
                  <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
