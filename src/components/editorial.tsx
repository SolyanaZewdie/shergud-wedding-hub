import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion";

/** Small uppercase editorial kicker. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("type-label text-muted-foreground", className)}>{children}</p>;
}

/** Numbered / kickered section heading with an optional aside. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  aside,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
        <h2 className="type-headline text-balance">{title}</h2>
        {lede ? <p className="type-lede mt-5 text-muted-foreground text-pretty">{lede}</p> : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </Reveal>
  );
}

/** Editorial text link with a nudging arrow. */
export function ArrowLink({
  to,
  search,
  children,
  className,
}: {
  to: string;
  search?: Record<string, unknown>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search={search as any}
      className={cn(
        "link-arrow underline-sweep type-label pb-1 text-foreground transition-colors hover:text-primary",
        className,
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

/** Full-bleed dark editorial band. */
export function DarkBand({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("grain bg-espresso text-espresso-foreground", className)}>
      {children}
    </section>
  );
}

export function StatLine({
  items,
  className,
}: {
  items: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4", className)}>
      {items.map((item, i) => (
        <Reveal key={item.label} delay={i * 90}>
          <dt className="type-label text-current/55">{item.label}</dt>
          <dd className="font-display mt-2 text-3xl sm:text-4xl">{item.value}</dd>
        </Reveal>
      ))}
    </dl>
  );
}
