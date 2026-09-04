import { useQuery } from "@tanstack/react-query";
import { resolveImageUrl } from "@/lib/data";
import { cn } from "@/lib/utils";

export function StoredImage({
  path,
  alt,
  className,
  eager = false,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
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
          "flex items-center justify-center bg-secondary text-xs text-muted-foreground",
          className,
        )}
      >
        No image yet
      </div>
    );
  }

  if (!data) return <div className={cn("animate-pulse bg-secondary", className)} />;

  return (
    <img
      src={data}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className={cn("object-cover", className)}
    />
  );
}
