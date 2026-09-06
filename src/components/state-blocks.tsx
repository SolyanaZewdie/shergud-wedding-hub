import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Layout-matching skeleton for a grid of editorial vendor cards. */
export function VendorSkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div
      className={cn("grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3", className)}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-4/5 w-full bg-parchment" />
          <div className="mt-5 h-3 w-20 bg-parchment" />
          <div className="mt-4 h-6 w-3/4 bg-parchment" />
          <div className="mt-3 h-3 w-1/2 bg-parchment" />
        </div>
      ))}
    </div>
  );
}

export function LoadingState({
  label = "Loading",
  variant = "grid",
}: {
  label?: string;
  variant?: "grid" | "lines" | "page";
}) {
  if (variant === "grid") {
    return (
      <div>
        <span className="sr-only" role="status">
          {label}
        </span>
        <VendorSkeletonGrid />
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <span className="sr-only" role="status">
          {label}
        </span>
        <div className="animate-pulse space-y-6">
          <div className="h-3 w-24 bg-parchment" />
          <div className="h-12 w-2/3 bg-parchment" />
          <div className="aspect-16/9 w-full bg-parchment" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-3 py-8">
      <span className="sr-only" role="status">
        {label}
      </span>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 w-full bg-parchment" />
      ))}
    </div>
  );
}

/** Human, editorial empty state. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-y border-border py-20 text-center", className)}>
      <h3 className="type-headline text-balance mx-auto max-w-lg">{title}</h3>
      {description ? (
        <p className="type-lede mx-auto mt-5 max-w-md text-muted-foreground text-pretty">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-8 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message = "We couldn't load this right now.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("border-y border-border py-20 text-center", className)}>
      <h3 className="type-headline">Something went wrong.</h3>
      <p className="type-lede mx-auto mt-5 max-w-md text-muted-foreground">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="type-label mt-8 cursor-pointer border-b border-foreground/30 pb-1.5 transition-colors hover:border-primary hover:text-primary"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
