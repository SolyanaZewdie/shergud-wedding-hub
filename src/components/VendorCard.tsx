import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { formatBirr, type Listing } from "@/lib/data";
import { cn } from "@/lib/utils";

export function VendorCard({
  listing,
  saved,
  onToggleSave,
}: {
  listing: Listing;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className="relative">
        <Link to="/vendors/$vendorId" params={{ vendorId: listing.id }} className="block">
          <StoredImage
            path={listing.cover_image}
            alt={`${listing.business_name} portfolio cover`}
            className="h-48 w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        {onToggleSave ? (
          <button
            onClick={onToggleSave}
            aria-label={saved ? "Remove from saved" : "Save vendor"}
            className="absolute right-3 top-3 rounded-full bg-background/90 p-2 shadow-soft transition-colors hover:bg-background"
          >
            <Heart
              className={cn(
                "h-4 w-4",
                saved ? "fill-primary text-primary" : "text-muted-foreground",
              )}
            />
          </button>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link to="/vendors/$vendorId" params={{ vendorId: listing.id }}>
            <h3 className="font-display text-lg leading-tight">{listing.business_name}</h3>
          </Link>
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
            {listing.category}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {listing.location ?? "Ethiopia"}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm">
            <span className="text-muted-foreground">from </span>
            <span className="font-medium">{formatBirr(listing.starting_price)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="font-medium">{listing.rating ?? "New"}</span>
            {listing.review_count ? (
              <span className="text-muted-foreground">({listing.review_count})</span>
            ) : null}
          </span>
        </div>
      </div>
    </article>
  );
}
