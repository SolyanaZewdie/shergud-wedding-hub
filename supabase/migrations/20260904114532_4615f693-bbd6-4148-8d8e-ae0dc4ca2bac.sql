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