import { cn } from "@/lib/utils";

/**
 * Shergud brand lockup: Amharic and Latin carry equal weight.
 */
export function Wordmark({
  compact = false,
  tone = "auto",
  className,
}: {
  compact?: boolean;
  tone?: "auto" | "light";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex items-baseline gap-2.5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        tone === "light" ? "text-espresso-foreground" : "text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "font-display leading-none tracking-[-0.03em] transition-all duration-500",
          compact ? "text-xl" : "text-2xl sm:text-[1.75rem]",
        )}
      >
        Shergud
      </span>
      <span
        className={cn(
          "font-ethiopic leading-none text-primary transition-all duration-500",
          compact ? "text-sm" : "text-base sm:text-lg",
        )}
      >
        ሽር ጉድ
      </span>
    </span>
  );
}
