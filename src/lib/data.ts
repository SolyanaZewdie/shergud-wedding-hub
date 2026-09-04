import { supabase } from "@/integrations/supabase/client";

export const CATEGORIES = ["Photography", "Venue", "Catering", "Decor", "Music", "Cake"] as const;

export const PORTFOLIO_BUCKET = "vendor-portfolio";

export type SortKey = "rating" | "relevance" | "price_asc" | "price_desc" | "newest";

export type Listing = {
  id: string;
  business_name: string;
  category: string;
  location: string | null;
  description: string | null;
  created_at: string;
  starting_price: number | null;
  rating: number | null;
  review_count: number | null;
  cover_image: string | null;
};

export type MarketplaceFilters = {
  category?: string | undefined;
  location?: string | undefined;
  maxPrice?: number | undefined;
  minRating?: number | undefined;
  sort: SortKey;
  search?: string | undefined;
};

/** Resolves a stored image reference (storage path or absolute URL) to a viewable URL. */
export async function resolveImageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { data } = await supabase.storage.from(PORTFOLIO_BUCKET).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export function formatBirr(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `ETB ${Number(value).toLocaleString("en-US")}`;
}

/**
 * Public marketplace query. Reads the vendor_public_listing view, which only
 * contains approved vendors that have at least one offering and one portfolio item.
 */
export async function fetchListings(filters: MarketplaceFilters): Promise<Listing[]> {
  let query = supabase.from("vendor_public_listing").select("*");

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.location) query = query.eq("location", filters.location);
  if (filters.search) query = query.ilike("business_name", `%${filters.search}%`);
  if (filters.maxPrice) query = query.lte("starting_price", filters.maxPrice);
  if (filters.minRating) query = query.gte("rating", filters.minRating);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("starting_price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("starting_price", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "relevance":
      query = query.order("business_name", { ascending: true });
      break;
    default:
      query = query.order("rating", { ascending: false, nullsFirst: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function fetchVendor(vendorId: string) {
  const [vendor, offerings, portfolio, reviews] = await Promise.all([
    supabase.from("vendor_profiles").select("*").eq("id", vendorId).maybeSingle(),
    supabase
      .from("vendor_offerings")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("price", { ascending: true }),
    supabase
      .from("vendor_portfolio")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: true }),
    supabase
      .from("reviews")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false }),
  ]);

  if (vendor.error) throw vendor.error;
  if (!vendor.data) return null;

  const ratings = (reviews.data ?? []).map((r) => r.rating);
  const rating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  return {
    vendor: vendor.data,
    offerings: offerings.data ?? [],
    portfolio: portfolio.data ?? [],
    reviews: reviews.data ?? [],
    rating,
    startingPrice: (offerings.data ?? []).reduce<number | null>(
      (min, o) => (min === null || Number(o.price) < min ? Number(o.price) : min),
      null,
    ),
  };
}

export async function fetchSavedVendorIds(userId: string) {
  const { data, error } = await supabase
    .from("saved_vendors")
    .select("vendor_id")
    .eq("couple_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.vendor_id);
}

export async function toggleSavedVendor(userId: string, vendorId: string, saved: boolean) {
  if (saved) {
    const { error } = await supabase
      .from("saved_vendors")
      .delete()
      .eq("couple_id", userId)
      .eq("vendor_id", vendorId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase
    .from("saved_vendors")
    .insert({ couple_id: userId, vendor_id: vendorId });
  if (error && error.code !== "23505") throw error;
  return true;
}

/** Finds or creates the single conversation between this couple and vendor. */
export async function getOrCreateConversation(coupleId: string, vendorId: string) {
  const existing = await supabase
    .from("conversations")
    .select("id")
    .eq("couple_id", coupleId)
    .eq("vendor_id", vendorId)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.id;

  const created = await supabase
    .from("conversations")
    .insert({ couple_id: coupleId, vendor_id: vendorId })
    .select("id")
    .single();
  if (created.error) throw created.error;
  return created.data.id;
}

export async function sendMessage(conversationId: string, senderId: string, message: string) {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, message });
  if (error) throw error;
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export type ConversationSummary = {
  id: string;
  couple_id: string;
  vendor_id: string;
  updated_at: string;
  vendor_name: string;
  counterpart: string;
  last_message: string | null;
};

export async function fetchConversations(userId: string): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, couple_id, vendor_id, updated_at, vendor_profiles(business_name)")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const summaries = await Promise.all(
    rows.map(async (row) => {
      const { data: last } = await supabase
        .from("messages")
        .select("message")
        .eq("conversation_id", row.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const vendorName =
        (row as unknown as { vendor_profiles?: { business_name?: string } }).vendor_profiles
          ?.business_name ?? "Vendor";
      let coupleName = "Couple";
      if (row.couple_id !== userId) {
        const { data: coupleProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", row.couple_id)
          .maybeSingle();
        coupleName = coupleProfile?.full_name || "Couple";
      }
      return {
        id: row.id,
        couple_id: row.couple_id,
        vendor_id: row.vendor_id,
        updated_at: row.updated_at,
        vendor_name: vendorName,
        counterpart: row.couple_id === userId ? vendorName : coupleName,
        last_message: last?.message ?? null,
      };
    }),
  );
  return summaries;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
