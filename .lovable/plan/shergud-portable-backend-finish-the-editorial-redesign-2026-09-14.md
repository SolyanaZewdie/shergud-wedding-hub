# Shergud: portable backend + finish the editorial redesign

Most of the app is already built and running on the current backend: sign-up, couple onboarding, marketplace with filters, vendor profiles, saving, messaging, vendor studio, admin approvals, and the redesigned home / directory / vendor pages. This plan covers the three things still missing: making the project portable, shipping one pasteable database file with seed data, and finishing the redesign on the signed-in pages.

## 1. Portable setup (GitHub + Vercel ready)

- Add a self-contained sign-in client that reads the standard `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` values and keeps the session in normal browser storage, with no editor-specific storage layer.
- Make Google sign-in fall back to the standard Supabase Google flow when the editor's sign-in broker isn't present, so the button keeps working on Vercel.
- Make the error reporting helper a no-op outside the editor (it already guards, confirm and document).
- Add `.env.example` with only the standard variable names, and a short `DEPLOY.md` covering: create the database from the SQL file, create the storage bucket, set two environment variables, deploy.
- Keep the app working exactly as it does today inside the editor — nothing is removed that the preview needs.

Note: the editor's own preview keeps using its built-in backend; the portable path is what a GitHub/Vercel copy uses.

## 2. One pasteable database file: `supabase/schema.sql`

Consolidate everything into a single ordered file that can be pasted into any Supabase SQL editor:

- Enums: account role, vendor verification status.
- Tables: `profiles`, `user_roles`, `couple_profiles`, `vendor_profiles`, `vendor_offerings`, `vendor_portfolio`, `saved_vendors` (unique couple+vendor), `conversations` (unique couple+vendor), `messages`, `reviews` — with foreign keys, indexes, and constraints.
- Access rules (RLS) on every table: couples reach only their own data, vendors manage only their own business, admins alone approve or reject.
- `vendor_public_listing` view enforcing the public rule: approved **and** at least one package **and** at least one portfolio image.
- Helper functions and triggers, including the sign-up trigger that creates the right profile rows for couples and vendors.
- Storage: `vendor-portfolio` bucket creation plus its access rules.
- Seed data: 8 Ethiopian wedding vendors across Photography, Venue, Catering and Decor with ETB pricing, packages, portfolio images and sample reviews.

Existing migration files stay untouched.

## 3. Finish the editorial redesign on signed-in pages

Apply the ivory / parchment / espresso / terracotta system already used on the public pages to the pages that still look plain, keeping every existing action and query intact:

- Onboarding: calm one-question-at-a-time flow (date and location required, guest count / budget / theme / colours optional).
- Couple dashboard: editorial wedding overview with a countdown and inline editing of the wedding details.
- Saved vendors: image-led collection layout with empty state.
- Messages: warm two-pane conversation view, single column on mobile.
- Vendor studio: sectioned business profile, packages and portfolio upload with clear pending / approved / rejected status.
- Admin queue: editorial review layout with approve and reject-with-reason.

## 4. Verification

- Build and type check clean.
- Browser pass on home, directory, a vendor profile, sign-in, onboarding, dashboard, messages, vendor studio and admin at 390px, 768px and 1440px: no sideways scrolling, no console errors.
- Confirm the marketplace only shows vendors that are approved and complete, and that saving and messaging survive a refresh.
