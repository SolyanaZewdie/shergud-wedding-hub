import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealWords } from "@/components/motion";
import { Wordmark } from "@/components/Wordmark";

const COLUMNS: { title: string; links: { label: string; to: string; search?: Record<string, unknown> }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "All vendors", to: "/vendors", search: { sort: "rating" } },
      { label: "Photography", to: "/vendors", search: { category: "Photography", sort: "rating" } },
      { label: "Venues", to: "/vendors", search: { category: "Venue", sort: "rating" } },
      { label: "Catering", to: "/vendors", search: { category: "Catering", sort: "rating" } },
    ],
  },
  {
    title: "Couples",
    links: [
      { label: "Start planning", to: "/auth", search: { mode: "signup" } },
      { label: "Our wedding", to: "/dashboard" },
      { label: "Saved vendors", to: "/saved" },
      { label: "Messages", to: "/messages" },
    ],
  },
  {
    title: "Vendors",
    links: [
      { label: "List your business", to: "/auth", search: { mode: "signup" } },
      { label: "Vendor studio", to: "/vendor" },
      { label: "Log in", to: "/auth" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="grain bg-espresso text-espresso-foreground">
      <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-24 sm:px-8 sm:pt-32">
        <h2 className="type-mega">
          <span className="block">
            <RevealWords text="Your day." />
          </span>
          <span className="block text-current/55">
            <RevealWords text="Your people." />
          </span>
          <span className="block font-ethiopic text-accent text-[0.62em] leading-[1.05]">
            <RevealWords text="ሽር ጉድ።" />
          </span>
        </h2>

        <Reveal className="mt-16 grid gap-12 border-t border-current/15 pt-12 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-current/70">
              A marketplace for Ethiopian weddings. Every vendor is reviewed by our team before
              couples ever see them.
            </p>
            <Link
              to="/vendors"
              search={{ sort: "rating" }}
              className="link-arrow type-label mt-8 inline-flex border-b border-current/40 pb-1.5 transition-colors hover:border-accent hover:text-accent"
            >
              Explore vendors
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="type-label text-current/50">{column.title}</h3>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        to={link.to as any}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        search={link.search as any}
                        className="underline-sweep text-sm text-current/80 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </Reveal>

        <div className="mt-16 flex flex-col gap-3 border-t border-current/15 pt-6 text-xs text-current/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shergud — Addis Ababa, Ethiopia.</p>
          <p className="font-ethiopic">ለሰርግዎ የሚያስፈልገው ሁሉ በአንድ ቦታ።</p>
        </div>
      </div>
    </footer>
  );
}
