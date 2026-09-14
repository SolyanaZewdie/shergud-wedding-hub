# Deploying Shergud (ሽር ጉድ) to your own Supabase + Vercel

Four steps, about fifteen minutes.

## 1. Create the database

In your Supabase project: **SQL Editor → New query**, paste the whole of
[`supabase/schema.sql`](supabase/schema.sql), and run it.

That single file creates everything: the tables (`profiles`, `user_roles`,
`couple_profiles`, `vendor_profiles`, `vendor_offerings`, `vendor_portfolio`,
`saved_vendors`, `conversations`, `messages`, `reviews`), the access rules, the
helper functions and sign-up trigger, the public `vendor_public_listing` view,
the private `vendor-portfolio` storage bucket with its upload rules, and eight
seeded Ethiopian wedding vendors with packages, portfolio images and reviews.

## 2. Turn on sign-in

**Authentication → Providers → Email**: on.

Optional Google sign-in: enable the **Google** provider and add
`https://your-domain.com/auth` to the redirect URLs.

To make your own account an admin, sign up in the app first, then run:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin' FROM public.profiles WHERE email = 'you@example.com'
  ON CONFLICT DO NOTHING;
```

## 3. Make the code portable

One file swap:

1. Delete `src/integrations/supabase/previewAuthStorage.ts`.
2. Replace `src/integrations/supabase/client.ts` with the contents of
   `src/integrations/supabase/client.portable.ts` (then delete that file).

The portable client reads the standard `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` variables and keeps the session in normal browser
storage. Every screen already imports `supabase` from
`@/integrations/supabase/client`, so nothing else changes.

Two optional tidy-ups, neither required for the app to work:

- `src/integrations/lovable/` and the `@lovable.dev/cloud-auth-js` package only
  power the editor's Google sign-in broker. The sign-in page already falls back
  to the standard Supabase Google flow when the broker isn't available, so you
  can delete the folder and the dependency and remove the fallback's first
  branch in `src/routes/auth.tsx`.
- `src/lib/lovable-error-reporting.ts` sends errors to the editor's console. It
  is a no-op outside the editor and is safe to keep or delete.

## 4. Deploy

Push to GitHub, import the repository into Vercel, and set two environment
variables:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See `.env.example`. Build command `npm run build`; the TanStack Start Vercel
preset is detected automatically.
