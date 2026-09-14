import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { StoredImage } from "@/components/StoredImage";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Eyebrow } from "@/components/editorial";

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
  component: VendorStudio,
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
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <header className="grain border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
          <Eyebrow>Vendor studio</Eyebrow>
          <h1 className="type-display mt-4 text-balance">
            {vendor?.business_name || "Create your listing"}
          </h1>

          {status ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="type-label flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    status === "approved"
                      ? "bg-primary"
                      : status === "rejected"
                        ? "bg-destructive"
                        : "bg-muted-foreground"
                  }`}
                  aria-hidden
                />
                {status === "approved"
                  ? readyToList
                    ? "Live in the marketplace"
                    : "Approved — one step left"
                  : status === "pending"
                    ? "Under review"
                    : "Changes requested"}
              </span>
              <span className="type-label text-muted-foreground">
                {offerings.length} package{offerings.length === 1 ? "" : "s"} ·{" "}
                {portfolio.length} image{portfolio.length === 1 ? "" : "s"}
              </span>
              {readyToList && vendor ? (
                <Link
                  to="/vendors/$vendorId"
                  params={{ vendorId: vendor.id }}
                  className="type-label link-arrow text-primary"
                >
                  View my public profile
                </Link>
              ) : null}
            </div>
          ) : null}

          <p className="type-lede mt-6 max-w-2xl text-muted-foreground">
            {!status
              ? "Fill in your business details below. Your listing goes to our team for approval."
              : status === "pending"
                ? "Our team is reviewing your listing. You can keep editing while you wait."
                : status === "rejected"
                  ? (vendor?.rejection_reason ??
                    "Your listing needs changes before it can go live.")
                  : readyToList
                    ? "Couples can find you in search and message you directly."
                    : "Add at least one package and one portfolio image to appear in search."}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
        <section className="border-t border-border pt-10">
          <Eyebrow>One · Business details</Eyebrow>
          <form
            className="mt-6 grid gap-6 lg:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveDetails.mutate();
            }}
          >
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="business_name" className="type-label text-muted-foreground">
                Business name
              </Label>
              <Input
                id="business_name"
                defaultValue={vendor?.business_name ?? ""}
                onChange={(e) => setDetails({ ...details, business_name: e.target.value })}
                required
                className="h-12 border-0 border-b border-border bg-transparent px-0 text-xl shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="type-label text-muted-foreground">Category</Label>
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
            <div className="space-y-2">
              <Label htmlFor="location" className="type-label text-muted-foreground">
                City
              </Label>
              <Input
                id="location"
                defaultValue={vendor?.location ?? ""}
                onChange={(e) => setDetails({ ...details, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="type-label text-muted-foreground">
                Phone
              </Label>
              <Input
                id="phone"
                defaultValue={vendor?.phone ?? ""}
                onChange={(e) => setDetails({ ...details, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="description" className="type-label text-muted-foreground">
                About your work
              </Label>
              <Textarea
                id="description"
                rows={5}
                defaultValue={vendor?.description ?? ""}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                className="font-serif text-lg"
              />
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" disabled={saveDetails.isPending} className="type-label">
                {saveDetails.isPending ? "Saving..." : vendor ? "Save changes" : "Create listing"}
              </Button>
            </div>
          </form>
        </section>

        {vendor ? (
          <>
            <section className="mt-16 border-t border-border pt-10">
              <Eyebrow>Two · Packages</Eyebrow>
              <div className="mt-6 divide-y divide-border border-y border-border">
                {offerings.length ? (
                  offerings.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-6 py-5">
                      <div>
                        <p className="font-display text-xl">{o.name}</p>
                        {o.description ? (
                          <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-serif text-lg">{formatBirr(Number(o.price))}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete package"
                          onClick={() => deleteOffering.mutate(o.id)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-5 font-serif text-lg text-muted-foreground">
                    No packages yet — add your first one below.
                  </p>
                )}
              </div>

              <form
                className="mt-6 grid gap-3 sm:grid-cols-[1fr_160px_auto]"
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
                <Button type="submit" disabled={addOffering.isPending} className="type-label">
                  Add
                </Button>
              </form>
            </section>

            <section className="mt-16 border-t border-border pt-10">
              <Eyebrow>Three · Portfolio</Eyebrow>
              {portfolio.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolio.map((item, index) => (
                    <div key={item.id} className="group relative overflow-hidden">
                      <StoredImage
                        path={item.image_url}
                        alt={item.title ?? "Portfolio image"}
                        className={`w-full ${index % 3 === 1 ? "aspect-3/4" : "aspect-4/5"}`}
                      />
                      <Button
                        variant="secondary"
                        size="icon"
                        aria-label="Delete image"
                        className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        onClick={() => deleteImage.mutate({ id: item.id, path: item.image_url })}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 font-serif text-lg text-muted-foreground">
                  Couples browse with their eyes — add a few of your best images.
                </p>
              )}

              <div className="mt-8 max-w-md space-y-2">
                <Label htmlFor="upload" className="type-label text-muted-foreground">
                  Add an image (max 10 MB)
                </Label>
                <Input
                  id="upload"
                  type="file"
                  accept="image/*"
                  disabled={uploadImage.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage.mutate(file);
                    e.target.value = "";
                  }}
                />
                {uploadImage.isPending ? (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

