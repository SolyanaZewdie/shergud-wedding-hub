import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Wordmark } from "@/components/Wordmark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type NavLink = { to: string; label: string; hash?: string };

export function SiteHeader() {
  const { user, profile, view, demoView, setDemoView, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const primary: NavLink[] = [{ to: "/vendors", label: "Vendors" }];
  const account: NavLink[] = [];

  if (user) {
    if (view === "couple") {
      account.push({ to: "/dashboard", label: "Our wedding" }, { to: "/saved", label: "Saved" });
    }
    if (view === "vendor") account.push({ to: "/vendor", label: "Vendor studio" });
    if (view === "admin") account.push({ to: "/admin", label: "Admin" });
    account.push({ to: "/messages", label: "Messages" });
  }

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/auth", replace: true });
  }

  const allLinks = [...primary, ...account];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled
          ? "border-b border-border/70 bg-background/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 transition-all duration-500 sm:px-8",
          scrolled ? "py-3" : "py-5",
        )}
      >
        <Link to="/" aria-label="Shergud home" className="shrink-0">
          <Wordmark compact={scrolled} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {allLinks.map((link) => (
            <Link
              key={link.to}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to={link.to as any}
              className="type-label underline-sweep pb-1 text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {!user ? (
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="type-label underline-sweep pb-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              For vendors
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Select value={demoView} onValueChange={(v) => setDemoView(v as AppRole | "auto")}>
                <SelectTrigger
                  className="type-label h-9 w-[168px] rounded-none border-border bg-transparent"
                  aria-label="Demo view"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">My role: {profile?.role ?? "—"}</SelectItem>
                  <SelectItem value="couple">Demo: couple view</SelectItem>
                  <SelectItem value="vendor">Demo: vendor view</SelectItem>
                  <SelectItem value="admin">Demo: admin view</SelectItem>
                </SelectContent>
              </Select>
              <button
                onClick={handleSignOut}
                className="type-label cursor-pointer text-muted-foreground transition-colors hover:text-primary"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="type-label text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="link-arrow type-label bg-primary px-5 py-3 text-primary-foreground transition-colors hover:bg-espresso"
              >
                Start planning
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </>
          )}
        </div>

        <button
          className="type-label cursor-pointer md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Full-screen editorial mobile navigation */}
      <div
        id="mobile-nav"
        className={cn(
          "grain fixed inset-0 z-40 flex flex-col bg-espresso text-espresso-foreground transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Wordmark compact tone="light" />
          <button onClick={() => setOpen(false)} className="type-label cursor-pointer">
            Close
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 pb-8 pt-6">
          <ul className="space-y-1">
            {allLinks.map((link, i) => (
              <li key={link.to}>
                <Link
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  to={link.to as any}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: `${80 + i * 45}ms` }}
                  className={cn(
                    "type-display block border-b border-current/12 py-4 transition-all duration-500",
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10 space-y-4">
            {user ? (
              <>
                <Select value={demoView} onValueChange={(v) => setDemoView(v as AppRole | "auto")}>
                  <SelectTrigger
                    className="type-label h-11 rounded-none border-current/25 bg-transparent"
                    aria-label="Demo view"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">My role: {profile?.role ?? "—"}</SelectItem>
                    <SelectItem value="couple">Demo: couple view</SelectItem>
                    <SelectItem value="vendor">Demo: vendor view</SelectItem>
                    <SelectItem value="admin">Demo: admin view</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={handleSignOut}
                  className="type-label w-full cursor-pointer border border-current/25 py-4"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  onClick={() => setOpen(false)}
                  className="type-label block bg-background py-4 text-center text-foreground"
                >
                  Start planning
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="type-label block border border-current/25 py-4 text-center"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
