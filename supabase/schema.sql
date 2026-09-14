-- ============================================================
-- SHERGUD (ሽር ጉድ) — complete, portable database setup
-- ------------------------------------------------------------
-- Run once in ANY Supabase project: SQL Editor -> New query -> paste -> Run.
-- Creates: enums, 10 tables, the public marketplace view, helper functions,
-- triggers, grants, RLS policies, the vendor-portfolio storage bucket and its
-- policies, and 8 seed vendors with packages, portfolio images and reviews.
-- Idempotent-ish: intended for an empty project. Re-running will error on
-- objects that already exist, which is safe to ignore.
-- ============================================================

-- ============================================================
-- STORAGE: vendor-portfolio bucket (private, 10 MB per file)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('vendor-portfolio', 'vendor-portfolio', false, 10485760)
ON CONFLICT (id) DO NOTHING;
-- roles
CREATE TYPE public.app_role AS ENUM ('couple','vendor','admin');
CREATE TYPE public.verification_status AS ENUM ('pending','approved','rejected');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role public.app_role NOT NULL DEFAULT 'couple',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.app_role;
BEGIN
  r := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'couple')::public.app_role;
  IF r = 'admin' THEN r := 'couple'; END IF;
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'business_name'), NEW.email, r)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r) ON CONFLICT DO NOTHING;
  IF r = 'couple' THEN
    INSERT INTO public.couple_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  ELSIF r = 'vendor' THEN
    INSERT INTO public.vendor_profiles (user_id, business_name, category, phone, location)
    VALUES (NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name','My Business'),
      COALESCE(NEW.raw_user_meta_data->>'category','Photography'),
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'location')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

-- couple profiles
CREATE TABLE public.couple_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wedding_date DATE,
  wedding_location TEXT,
  guest_count INTEGER,
  budget NUMERIC,
  theme TEXT,
  colors TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.couple_profiles TO authenticated;
GRANT ALL ON public.couple_profiles TO service_role;
ALTER TABLE public.couple_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own couple profile" ON public.couple_profiles FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER couple_updated BEFORE UPDATE ON public.couple_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- vendor profiles (user_id nullable so demo/seed vendors can exist without an auth account)
CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  description TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendor_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.vendor_profiles TO authenticated;
GRANT ALL ON public.vendor_profiles TO service_role;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER vendor_updated BEFORE UPDATE ON public.vendor_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "approved vendors public read" ON public.vendor_profiles FOR SELECT TO anon, authenticated USING (verification_status = 'approved');
CREATE POLICY "own vendor read" ON public.vendor_profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own vendor update" ON public.vendor_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid() AND verification_status = (SELECT v.verification_status FROM public.vendor_profiles v WHERE v.id = vendor_profiles.id));
CREATE POLICY "own vendor insert" ON public.vendor_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND verification_status = 'pending');
CREATE POLICY "admin vendor read" ON public.vendor_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin vendor update" ON public.vendor_profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.vendor_is_approved(_vendor_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.vendor_profiles WHERE id = _vendor_id AND verification_status = 'approved');
$$;
CREATE OR REPLACE FUNCTION public.owns_vendor(_vendor_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.vendor_profiles WHERE id = _vendor_id AND user_id = auth.uid());
$$;

-- offerings
CREATE TABLE public.vendor_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendor_offerings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_offerings TO authenticated;
GRANT ALL ON public.vendor_offerings TO service_role;
ALTER TABLE public.vendor_offerings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER offerings_updated BEFORE UPDATE ON public.vendor_offerings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "public offerings read" ON public.vendor_offerings FOR SELECT TO anon, authenticated USING (public.vendor_is_approved(vendor_id));
CREATE POLICY "own offerings" ON public.vendor_offerings FOR ALL TO authenticated USING (public.owns_vendor(vendor_id)) WITH CHECK (public.owns_vendor(vendor_id));
CREATE POLICY "admin offerings read" ON public.vendor_offerings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- portfolio
CREATE TABLE public.vendor_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vendor_portfolio TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_portfolio TO authenticated;
GRANT ALL ON public.vendor_portfolio TO service_role;
ALTER TABLE public.vendor_portfolio ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER portfolio_updated BEFORE UPDATE ON public.vendor_portfolio FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "public portfolio read" ON public.vendor_portfolio FOR SELECT TO anon, authenticated USING (public.vendor_is_approved(vendor_id));
CREATE POLICY "own portfolio" ON public.vendor_portfolio FOR ALL TO authenticated USING (public.owns_vendor(vendor_id)) WITH CHECK (public.owns_vendor(vendor_id));
CREATE POLICY "admin portfolio read" ON public.vendor_portfolio FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reviews read" ON public.reviews FOR SELECT TO anon, authenticated USING (public.vendor_is_approved(vendor_id));
CREATE POLICY "own review insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND is_sample = false);

-- saved vendors
CREATE TABLE public.saved_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_id, vendor_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_vendors TO authenticated;
GRANT ALL ON public.saved_vendors TO service_role;
ALTER TABLE public.saved_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved vendors" ON public.saved_vendors FOR ALL TO authenticated USING (couple_id = auth.uid()) WITH CHECK (couple_id = auth.uid());

-- conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (couple_id, vendor_id)
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER conversations_updated BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "participant conversations" ON public.conversations FOR ALL TO authenticated
  USING (couple_id = auth.uid() OR public.owns_vendor(vendor_id))
  WITH CHECK (couple_id = auth.uid() OR public.owns_vendor(vendor_id));

CREATE OR REPLACE FUNCTION public.in_conversation(_conversation_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    LEFT JOIN public.vendor_profiles v ON v.id = c.vendor_id
    WHERE c.id = _conversation_id AND (c.couple_id = auth.uid() OR v.user_id = auth.uid())
  );
$$;

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participant messages read" ON public.messages FOR SELECT TO authenticated USING (public.in_conversation(conversation_id));
CREATE POLICY "participant messages send" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.in_conversation(conversation_id) AND sender_id = auth.uid());
CREATE POLICY "participant messages update" ON public.messages FOR UPDATE TO authenticated USING (public.in_conversation(conversation_id)) WITH CHECK (public.in_conversation(conversation_id));

-- public marketplace listing
CREATE VIEW public.vendor_public_listing WITH (security_invoker = on) AS
SELECT v.id, v.business_name, v.category, v.location, v.description, v.created_at,
  (SELECT min(o.price) FROM public.vendor_offerings o WHERE o.vendor_id = v.id) AS starting_price,
  (SELECT round(avg(r.rating)::numeric, 1) FROM public.reviews r WHERE r.vendor_id = v.id) AS rating,
  (SELECT count(*) FROM public.reviews r WHERE r.vendor_id = v.id) AS review_count,
  (SELECT p.image_url FROM public.vendor_portfolio p WHERE p.vendor_id = v.id ORDER BY p.created_at ASC LIMIT 1) AS cover_image
FROM public.vendor_profiles v
WHERE v.verification_status = 'approved'
  AND EXISTS (SELECT 1 FROM public.vendor_offerings o WHERE o.vendor_id = v.id)
  AND EXISTS (SELECT 1 FROM public.vendor_portfolio p WHERE p.vendor_id = v.id);
GRANT SELECT ON public.vendor_public_listing TO anon, authenticated;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.in_conversation(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.owns_vendor(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.in_conversation(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_vendor(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vendor_is_approved(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.in_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_vendor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vendor_is_approved(uuid) TO anon, authenticated;
CREATE POLICY "portfolio images viewable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'vendor-portfolio');
CREATE POLICY "vendor uploads own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vendor-portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vendor updates own folder" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vendor-portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "vendor deletes own folder" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vendor-portfolio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE OR REPLACE FUNCTION public.shares_conversation(_other_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations c
    LEFT JOIN public.vendor_profiles v ON v.id = c.vendor_id
    WHERE (c.couple_id = auth.uid() AND v.user_id = _other_id)
       OR (v.user_id = auth.uid() AND c.couple_id = _other_id)
  )
$$;

REVOKE ALL ON FUNCTION public.shares_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.shares_conversation(uuid) TO authenticated;

CREATE POLICY "conversation participant profile read"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.shares_conversation(id));
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_vendor(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.in_conversation(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.shares_conversation(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_vendor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.in_conversation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_conversation(uuid) TO authenticated;

-- ============================================================
-- SEED DATA — 8 Ethiopian wedding vendors, approved and complete
-- (approved + at least 1 offering + at least 1 portfolio image, so they all
--  appear in vendor_public_listing immediately).
-- Portfolio images point at placeholder photo URLs. Replace them with real
-- uploads to the vendor-portfolio bucket when you have final imagery.
-- ============================================================
INSERT INTO public.vendor_profiles
  (id, user_id, business_name, category, phone, location, description, verification_status, approved_at)
VALUES
  ('a0000000-0000-4000-8000-000000000001', NULL, 'Selam Studios', 'Photography', '+251 911 223344', 'Addis Ababa',
   'Documentary wedding photography with a warm, unhurried eye. More than 200 Ethiopian weddings covered, from intimate mels ceremonies to full three-day celebrations.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000002', NULL, 'Habesha Frames', 'Photography', '+251 912 887766', 'Addis Ababa',
   'A husband-and-wife team creating editorial wedding films and photographs across Ethiopia. Fine-art albums printed locally.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000003', NULL, 'Entoto Garden Hall', 'Venue', '+251 913 445566', 'Addis Ababa',
   'An open-air garden venue on the Entoto slopes seating up to 500 guests, with covered pavilions, generator backup and private parking.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000004', NULL, 'Sheger Grand Ballroom', 'Venue', '+251 914 332211', 'Addis Ababa',
   'A classic ballroom in the heart of Bole with gold detailing, in-house sound and dedicated bridal suites.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000005', NULL, 'Yod Abyssinia Catering', 'Catering', '+251 915 778899', 'Addis Ababa',
   'Traditional Ethiopian banquet catering — doro wot, kitfo, tibs and vegetarian fasting menus — served by a trained brigade.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000006', NULL, 'Buna & Bites', 'Catering', '+251 916 664422', 'Bishoftu',
   'Modern fusion menus and a full traditional coffee ceremony station for your reception.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000007', NULL, 'Tesfa Events & Decor', 'Decor', '+251 917 556677', 'Addis Ababa',
   'Full-service wedding styling: stage design, floral arches, drapery, lighting and hand-woven Ethiopian textiles.', 'approved', now()),
  ('a0000000-0000-4000-8000-000000000008', NULL, 'Meskel Blooms', 'Decor', '+251 918 991122', 'Hawassa',
   'Seasonal florals and intimate reception styling for couples who want something quietly beautiful.', 'approved', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.vendor_offerings (vendor_id, name, description, price) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Essential Day Coverage', '8 hours of coverage, one photographer, 300 edited images.', 35000),
  ('a0000000-0000-4000-8000-000000000001', 'Full Celebration Package', 'Two days, two photographers, printed album and engagement session.', 72000),
  ('a0000000-0000-4000-8000-000000000002', 'Half Day Photography', '5 hours of coverage with 200 edited images.', 28000),
  ('a0000000-0000-4000-8000-000000000002', 'Photo + Film Package', 'Full day photo and cinematic highlight film.', 85000),
  ('a0000000-0000-4000-8000-000000000003', 'Garden Ceremony Hire', 'Exclusive garden hire for 6 hours, up to 300 guests.', 120000),
  ('a0000000-0000-4000-8000-000000000003', 'Full Day Venue Hire', 'Whole property for the day, up to 500 guests, staff included.', 210000),
  ('a0000000-0000-4000-8000-000000000004', 'Evening Reception Hire', 'Ballroom for 5 hours including sound and lighting.', 95000),
  ('a0000000-0000-4000-8000-000000000004', 'Ballroom + Bridal Suite', 'Full evening hire with two bridal suites and valet parking.', 150000),
  ('a0000000-0000-4000-8000-000000000005', 'Traditional Banquet', 'Per guest traditional menu with injera, wot and salads.', 650),
  ('a0000000-0000-4000-8000-000000000005', 'Premium Banquet', 'Per guest premium menu including kitfo and dessert table.', 980),
  ('a0000000-0000-4000-8000-000000000006', 'Fusion Menu', 'Per guest three-course fusion menu with service staff.', 890),
  ('a0000000-0000-4000-8000-000000000006', 'Coffee Ceremony Station', 'Traditional jebena coffee ceremony for the reception.', 12000),
  ('a0000000-0000-4000-8000-000000000007', 'Ceremony Styling', 'Stage design, floral arch, drapery and lighting for the ceremony.', 60000),
  ('a0000000-0000-4000-8000-000000000007', 'Full Wedding Styling', 'Ceremony and reception styling with Ethiopian handwoven textiles.', 145000),
  ('a0000000-0000-4000-8000-000000000008', 'Seasonal Florals', 'Bridal bouquet, bridesmaids and buttonholes in seasonal blooms.', 18000),
  ('a0000000-0000-4000-8000-000000000008', 'Intimate Reception Styling', 'Table florals, candles and styling for up to 80 guests.', 46000);

INSERT INTO public.vendor_portfolio (vendor_id, image_url, title) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'https://picsum.photos/seed/shergud-photo-1/1400/1000', 'Garden ceremony, Addis Ababa'),
  ('a0000000-0000-4000-8000-000000000001', 'https://picsum.photos/seed/shergud-photo-2/1400/1000', 'Golden hour portraits'),
  ('a0000000-0000-4000-8000-000000000002', 'https://picsum.photos/seed/shergud-photo-3/1400/1000', 'Highland sunset session'),
  ('a0000000-0000-4000-8000-000000000002', 'https://picsum.photos/seed/shergud-photo-4/1400/1000', 'Traditional dress portraits'),
  ('a0000000-0000-4000-8000-000000000003', 'https://picsum.photos/seed/shergud-venue-1/1400/1000', 'Garden pavilion at dusk'),
  ('a0000000-0000-4000-8000-000000000003', 'https://picsum.photos/seed/shergud-venue-2/1400/1000', 'Ceremony seating on the lawn'),
  ('a0000000-0000-4000-8000-000000000004', 'https://picsum.photos/seed/shergud-venue-3/1400/1000', 'The main ballroom'),
  ('a0000000-0000-4000-8000-000000000004', 'https://picsum.photos/seed/shergud-venue-4/1400/1000', 'Outdoor terrace'),
  ('a0000000-0000-4000-8000-000000000005', 'https://picsum.photos/seed/shergud-food-1/1400/1000', 'Traditional banquet spread'),
  ('a0000000-0000-4000-8000-000000000005', 'https://picsum.photos/seed/shergud-food-2/1400/1000', 'Coffee ceremony service'),
  ('a0000000-0000-4000-8000-000000000006', 'https://picsum.photos/seed/shergud-food-3/1400/1000', 'Reception coffee ceremony'),
  ('a0000000-0000-4000-8000-000000000006', 'https://picsum.photos/seed/shergud-food-4/1400/1000', 'Fusion banquet table'),
  ('a0000000-0000-4000-8000-000000000007', 'https://picsum.photos/seed/shergud-decor-1/1400/1000', 'Stage design with handwoven textiles'),
  ('a0000000-0000-4000-8000-000000000007', 'https://picsum.photos/seed/shergud-decor-2/1400/1000', 'Candlelit reception tables'),
  ('a0000000-0000-4000-8000-000000000008', 'https://picsum.photos/seed/shergud-decor-3/1400/1000', 'Seasonal bridal bouquet'),
  ('a0000000-0000-4000-8000-000000000008', 'https://picsum.photos/seed/shergud-decor-4/1400/1000', 'Lakeside reception styling');

INSERT INTO public.reviews (vendor_id, author_name, rating, comment, is_sample) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'Hanna & Dawit', 5, 'They felt like family by the end of the day. The photos still make my mother cry.', true),
  ('a0000000-0000-4000-8000-000000000001', 'Meron T.', 5, 'Calm, professional and never in the way. Worth every birr.', true),
  ('a0000000-0000-4000-8000-000000000001', 'Yonas A.', 4, 'Beautiful images, delivery took a little longer than promised.', true),
  ('a0000000-0000-4000-8000-000000000002', 'Bethel & Samuel', 5, 'The film is the best money we spent on our wedding.', true),
  ('a0000000-0000-4000-8000-000000000002', 'Liya G.', 4, 'Lovely editorial style, very organised team.', true),
  ('a0000000-0000-4000-8000-000000000003', 'Rahel & Abel', 5, 'The garden at sunset was exactly what we dreamed of. Staff handled everything.', true),
  ('a0000000-0000-4000-8000-000000000003', 'Tigist M.', 4, 'Gorgeous space. Parking gets tight with 400+ guests.', true),
  ('a0000000-0000-4000-8000-000000000004', 'Selam & Nahom', 5, 'Elegant hall, excellent sound, guests were very comfortable.', true),
  ('a0000000-0000-4000-8000-000000000004', 'Kalkidan B.', 4, 'Great venue, would ask for more setup time next time.', true),
  ('a0000000-0000-4000-8000-000000000005', 'Eden & Fitsum', 5, 'The doro wot was perfect and the service was seamless.', true),
  ('a0000000-0000-4000-8000-000000000005', 'Girum H.', 5, 'Our elders were impressed, which says everything.', true),
  ('a0000000-0000-4000-8000-000000000006', 'Sara & Michael', 5, 'The coffee ceremony was the highlight of the reception.', true),
  ('a0000000-0000-4000-8000-000000000006', 'Nardos K.', 4, 'Creative menus and warm staff.', true),
  ('a0000000-0000-4000-8000-000000000007', 'Mahlet & Yared', 5, 'They transformed the hall completely. Our guests could not stop taking photos.', true),
  ('a0000000-0000-4000-8000-000000000007', 'Dagmawit S.', 4, 'Strong design ideas, very responsive on the day.', true),
  ('a0000000-0000-4000-8000-000000000008', 'Feven & Abenezer', 5, 'Quiet, beautiful florals exactly as we described them.', true),
  ('a0000000-0000-4000-8000-000000000008', 'Helen A.', 5, 'Lakeside setup was stunning at sunset.', true);

-- ============================================================
-- AUTH NOTE
-- Email/password sign-in must be enabled in your project:
--   Authentication -> Providers -> Email (on).
-- Optional Google sign-in: Authentication -> Providers -> Google, then add
--   https://<your-domain>/auth as a redirect URL.
-- New sign-ups are handled by the handle_new_user() trigger above, which
-- creates the profile, the role row, and either a couple_profiles row or a
-- pending vendor_profiles row from the sign-up metadata.
--
-- To make yourself an admin after signing up, run:
--   UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
--   INSERT INTO public.user_roles (user_id, role)
--     SELECT id, 'admin' FROM public.profiles WHERE email = 'you@example.com'
--     ON CONFLICT DO NOTHING;
-- ============================================================
