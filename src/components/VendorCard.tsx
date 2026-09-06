import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { SaveButton } from "@/components/SaveButton";
import { formatBirr, type Listing } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Editorial vendor card: photograph first, metadata as quiet caption text.
 */
export function VendorCard({
  listing,
  saved,
  onToggleSave,
  index = 0,
  className,
}: {
  listing: Listing;
  saved?: boolean | undefined;
  onToggleSave?: (() => void) | undefined;
  index?: number;
  className?: string;
}) {
  return (
    <article className={cn("group/card relative", className)}>
      <Link
        to="/vendors/$vendorId"
        params={{ vendorId: listing.id }}
        className="block focus-visible:outline-offset-4"
      >
        <div className="relative aspect-4/5 w-full overflow-hidden bg-parchment">
          <StoredImage
            path={listing.cover_image}
            alt={`Work by ${listing.business_name}`}
            eager={index < 3}
            className="transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.05]"
          />
          <span className="type-label absolute bottom-0 left-0 bg-background/90 px-3 py-2 text-foreground backdrop-blur-sm">
            {listing.category}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="type-title text-balance transition-colors group-hover/card:text-primary">
              {listing.business_name}
            </h3>
            <span className="type-label flex shrink-0 items-center gap-1.5 text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />
              {listing.rating ?? "New"}
              {listing.review_count ? <span className="opacity-60">({listing.review_count})</span> : null}
            </span>
          </div>

          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{listing.location ?? "Ethiopia"}</span>
            <span aria-hidden className="h-3 w-px bg-border" />
            <span>from {formatBirr(listing.starting_price)}</span>
          </p>
        </div>
      </Link>

      {onToggleSave ? <SaveButton saved={Boolean(saved)} onToggle={onToggleSave} /> : null}
    </article>
  );
}
