import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useAuth, type AppRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SiteHeader() {
  const { user, profile, view, demoView, setDemoView, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links: { to: string; label: string }[] = [{ to: "/vendors", label: "Marketplace" }];
  if (user) {
    if (view === "couple") {
      links.push({ to: "/dashboard", label: "Our Wedding" }, { to: "/saved", label: "Saved" });
    }
    if (view === "vendor") links.push({ to: "/vendor", label: "Vendor Studio" });
    if (view === "admin") links.push({ to: "/admin", label: "Admin" });
    links.push({ to: "/messages", label: "Messages" });
  }

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none text-primary">Shergud</span>
          <span className="font-display text-lg leading-none text-accent-foreground/70">ሽር ጉድ</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-primary [&.active]:text-primary [&.active]:font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Select value={demoView} onValueChange={(v) => setDemoView(v as AppRole | "auto")}>
                <SelectTrigger className="h-9 w-[150px] text-xs" aria-label="Demo view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">My role: {profile?.role ?? "—"}</SelectItem>
                  <SelectItem value="couple">Demo: couple view</SelectItem>
                  <SelectItem value="vendor">Demo: vendor view</SelectItem>
                  <SelectItem value="admin">Demo: admin view</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Select value={demoView} onValueChange={(v) => setDemoView(v as AppRole | "auto")}>
                  <SelectTrigger className="h-9 text-xs" aria-label="Demo view">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">My role: {profile?.role ?? "—"}</SelectItem>
                    <SelectItem value="couple">Demo: couple view</SelectItem>
                    <SelectItem value="vendor">Demo: vendor view</SelectItem>
                    <SelectItem value="admin">Demo: admin view</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth" search={{ mode: "signup" }} onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
