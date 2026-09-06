import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shortlist toggle. Purely presentational — the caller owns the mutation.
 */
export function SaveButton({
  saved,
  onToggle,
  pending,
  variant = "floating",
  className,
}: {
  saved: boolean;
  onToggle: () => void;
  pending?: boolean;
  variant?: "floating" | "inline";
  className?: string;
}) {
  const label = saved ? "Remove from your shortlist" : "Save to your shortlist";

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          "link-arrow type-label group cursor-pointer border-b border-foreground/25 pb-1.5 transition-colors hover:border-primary hover:text-primary disabled:opacity-50",
          className,
        )}
      >
        <Heart
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110",
            saved && "fill-primary text-primary scale-110",
          )}
          aria-hidden
        />
        {saved ? "Saved" : "Save vendor"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        "group absolute right-3 top-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-background/85 backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-background focus-visible:opacity-100 disabled:opacity-60",
        "opacity-0 translate-y-1 sm:group-hover/card:opacity-100 sm:group-hover/card:translate-y-0 sm:focus-within:opacity-100",
        "max-sm:opacity-100 max-sm:translate-y-0",
        saved && "opacity-100 translate-y-0",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-115",
          saved ? "fill-primary text-primary" : "text-foreground",
        )}
        aria-hidden
      />
    </button>
  );
}
