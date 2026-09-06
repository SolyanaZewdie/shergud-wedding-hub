import { useQuery } from "@tanstack/react-query";
import { resolveImageUrl } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Renders an image stored in the private portfolio bucket (or an absolute URL).
 * Always fills its parent — give the parent the aspect ratio you want.
 */
export function StoredImage({
  path,
  alt,
  className,
  wrapperClassName,
  eager = false,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  eager?: boolean;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["image", path],
    queryFn: () => resolveImageUrl(path),
    enabled: Boolean(path),
    staleTime: 1000 * 60 * 30,
  });

  if (!path || (!data && !isLoading)) {
    return (
      <div
        className={cn(
          "grain flex h-full w-full items-center justify-center bg-parchment",
          wrapperClassName,
          className,
        )}
      >
        <span className="type-label text-muted-foreground/70">Shergud</span>
      </div>
    );
  }

  if (!data) {
    return <div className={cn("h-full w-full animate-pulse bg-parchment", wrapperClassName, className)} />;
  }

  return (
    <img
      src={data}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
