-- ============================================================
-- SHERGUD (ሽር ጉድ) — 18 Curated Ethiopian Wedding Vendors
-- 3 vendors for each of the 6 categories:
-- Photography, Venue, Catering, Decor, Music, Cake.
-- Complete with offerings, pricing (ETB), portfolio photos, and reviews.
-- Run in your Supabase SQL Editor to populate the marketplace immediately!
-- ============================================================

-- 1. Insert 18 Vendor Profiles
INSERT INTO public.vendor_profiles
  (id, user_id, business_name, category, phone, location, description, verification_status, approved_at)
VALUES
  -- Photography (3)
  ('b0000000-0000-4000-8000-000000000001', NULL, 'Selam Studios', 'Photography', '+251 911 223344', 'Addis Ababa (Bole)',
   'Documentary wedding photography with a warm, timeless eye. Over 200 Ethiopian weddings covered, from intimate mels ceremonies to full three-day celebrations across the country.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000002', NULL, 'Habesha Frames & Cinema', 'Photography', '+251 912 887766', 'Addis Ababa (Kazanchis)',
   'Editorial wedding films and high-fashion photography. Specializing in traditional habesha kemis detail shots, 4K drone videography, and luxury wedding albums.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000003', NULL, 'Zemen Visual Storytellers', 'Photography', '+251 911 554433', 'Addis Ababa (Sarbet)',
   'Authentic, modern visual storytelling capturing the raw energy of eskista, family blessings, and intimate bride-and-groom sunset moments.', 'approved', now()),

  -- Venue (3)
  ('b0000000-0000-4000-8000-000000000004', NULL, 'Entoto Mountain Garden Pavilion', 'Venue', '+251 913 445566', 'Addis Ababa (Entoto)',
   'A majestic pine-forest mountain retreat overlooking Addis Ababa. Seating up to 600 guests with manicured lawns, covered glass pavilions, backup generators, and private parking.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000005', NULL, 'Sheger Grand Ballroom', 'Venue', '+251 914 332211', 'Addis Ababa (Bole Medhanialem)',
   'An opulent ballroom in the heart of Bole featuring high ceilings, crystal chandeliers, gold accents, professional concert acoustics, and bridal prep suites.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000006', NULL, 'Bishoftu Crater Lake Lawn & Resort', 'Venue', '+251 920 112233', 'Bishoftu',
   'Romantic lakefront gardens on the shores of Lake Babogaya. Perfect for destination weddings within 45 minutes of Addis Ababa, with sunset dock access and chalets.', 'approved', now()),

  -- Catering (3)
  ('b0000000-0000-4000-8000-000000000007', NULL, 'Yod Abyssinia Royal Catering', 'Catering', '+251 915 778899', 'Addis Ababa (Bole)',
   'Master chefs of traditional Ethiopian gastronomy. Serving authentic slow-cooked doro wot, segaye tibs, gurage kitfo, and vegetarian fasting feasts with impeccable presentation.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000008', NULL, 'Buna & Bites Gourmet Catering', 'Catering', '+251 916 664422', 'Addis Ababa (Old Airport)',
   'Contemporary culinary masters blending Ethiopian heritage flavors with international fine dining. Known for live cooking stations, artisan canapes, and bespoke dessert bars.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000009', NULL, 'Kidan Traditional Feast Kitchen', 'Catering', '+251 911 776655', 'Addis Ababa (CMC)',
   'Generous, soul-satisfying wedding banquets crafted with pure butter, organic berbere, and tender local meats. Trusted by Ethiopian families for over 15 years.', 'approved', now()),

  -- Decor (3)
  ('b0000000-0000-4000-8000-000000000010', NULL, 'Tesfa Events & Luxury Decor', 'Decor', '+251 917 556677', 'Addis Ababa (Bole)',
   'Breathtaking stage architecture, custom fabric drapery, cascading fairy light canopies, and handwoven Ethiopian motifs tailored to your personal love story.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000011', NULL, 'Meskel Blooms & Botanicals', 'Decor', '+251 918 991122', 'Addis Ababa (Gerji)',
   'Highland rose growers and botanical designers creating romantic floral arches, delicate bridal bouquets, eucalyptus table runners, and candlelit centerpieces.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000012', NULL, 'Zoma Heritage Styling', 'Decor', '+251 912 334455', 'Addis Ababa (Mekanisa)',
   'Specializing in culturally rich, organic wedding designs. Incorporating polished Ethiopian brass, natural clay vessels, warm candlelight, and indigenous flora.', 'approved', now()),

  -- Music (3)
  ('b0000000-0000-4000-8000-000000000013', NULL, 'Eskista Groove Live Band', 'Music', '+251 911 889900', 'Addis Ababa (Piazza)',
   'An energetic 8-piece Ethiopian live band featuring brass section, electronic kirar, keyboards, and phenomenal vocalists playing timeless classic ballads to high-tempo eskista.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000014', NULL, 'DJ Henok & Sound Addis', 'Music', '+251 913 221100', 'Addis Ababa (Bole)',
   'Addis Ababa premier wedding DJ equipped with concert-grade JBL Line Array speakers, wireless microphones, wireless uplighting, and seamless transitions between traditional and modern tracks.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000015', NULL, 'Meleket Traditional Ensemble', 'Music', '+251 914 556677', 'Addis Ababa (Yeka)',
   'Master cultural instrumentalists and azmari vocalists playing acoustic krar, washint flute, and kebero drums. Welcoming bridal arrivals and leading joyful cultural dances.', 'approved', now()),

  -- Cake (3)
  ('b0000000-0000-4000-8000-000000000016', NULL, 'Bole Sweet Artistry', 'Cake', '+251 911 332211', 'Addis Ababa (Bole Atlas)',
   'Couture multi-tiered wedding cakes with handcrafted sugar blossoms, edible 24k gold leaf accents, and mouthwatering fillings from Belgian chocolate to salted caramel.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000017', NULL, 'Cacao & Vanilla Pastry Studio', 'Cake', '+251 912 667788', 'Addis Ababa (Bisrate Gabriel)',
   'Modern architectural wedding cakes, macaron towers, and gourmet dessert tables crafted with imported French chocolate and natural Madagascar vanilla beans.', 'approved', now()),
  ('b0000000-0000-4000-8000-000000000018', NULL, 'Habesha Sugar & Spice', 'Cake', '+251 915 443322', 'Addis Ababa (Kazanchis)',
   'Specializing in culturally inspired wedding cakes adorned with golden Ethiopian cross designs, embroidered patterns, cardamom spiced chocolate, and honey teff sponge.', 'approved', now())
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  category = EXCLUDED.category,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  description = EXCLUDED.description,
  verification_status = 'approved',
  approved_at = now();

-- 2. Insert Offerings & Pricing (ETB)
DELETE FROM public.vendor_offerings WHERE vendor_id LIKE 'b0000000-0000-4000-8000-%';

INSERT INTO public.vendor_offerings (vendor_id, name, description, price) VALUES
  -- Photography
  ('b0000000-0000-4000-8000-000000000001', 'Essential Day Coverage', '8 hours of coverage, one lead photographer, 350 high-res retouched images.', 35000),
  ('b0000000-0000-4000-8000-000000000001', 'Grand 2-Day Celebration Package', 'Two photographers, engagement session, printed leather album, and drone footage.', 75000),
  ('b0000000-0000-4000-8000-000000000002', 'Half-Day Editorial Shoot', '5 hours coverage, 200 edited images, and online guest gallery.', 28000),
  ('b0000000-0000-4000-8000-000000000002', 'Cinematic Photo & 4K Film', 'Full day coverage, 2 cinematographers, highlight teaser, and 45-min documentary film.', 85000),
  ('b0000000-0000-4000-8000-000000000003', 'Classic Wedding Collection', 'Full day documentary wedding photography with 400 edited images.', 45000),
  ('b0000000-0000-4000-8000-000000000003', 'Royal 3-Day Wedding & Mels', 'Full coverage for wedding day, family dinner, and traditional mels celebration.', 95000),

  -- Venue
  ('b0000000-0000-4000-8000-000000000004', 'Garden Lawn Ceremony', 'Exclusive garden hire for 6 hours, up to 350 guests with backup power generator.', 120000),
  ('b0000000-0000-4000-8000-000000000004', 'Complete Estate Exclusive Hire', 'Full day access to mountain gardens, glass pavilion, bridal cottage, up to 600 guests.', 210000),
  ('b0000000-0000-4000-8000-000000000005', 'Evening Ballroom Reception', '5 hours ballroom hire including stage lighting, sound setup, and cleaning staff.', 95000),
  ('b0000000-0000-4000-8000-000000000005', 'Royal Ballroom + Suites', 'Full evening hire with two luxury bridal dressing suites, VIP lounge, and valet.', 165000),
  ('b0000000-0000-4000-8000-000000000006', 'Lakeside Lawn Ceremony', 'Waterfront lawn ceremony with outdoor sound and sunset dock access.', 135000),
  ('b0000000-0000-4000-8000-000000000006', 'Weekend Destination Package', 'Exclusive resort lawn hire plus 6 lakeside chalets for immediate family for 2 nights.', 280000),

  -- Catering
  ('b0000000-0000-4000-8000-000000000007', 'Traditional Habesha Feast', 'Per guest traditional buffet: doro wot, segaye tibs, fasting dishes, teff injera, and drinks.', 650),
  ('b0000000-0000-4000-8000-000000000007', 'Imperial Royal Banquet', 'Per guest premium feast including Gurage kitfo, roasted lamb, salad bar, and dessert.', 980),
  ('b0000000-0000-4000-8000-000000000008', 'Modern Fusion Banquet', 'Per guest three-course plated dinner combining continental cuisine and Ethiopian dishes.', 890),
  ('b0000000-0000-4000-8000-000000000008', 'Jebena Coffee Ceremony Lounge', 'Dedicated traditional coffee ceremony station with frankincense, popcorn, and sweets.', 14000),
  ('b0000000-0000-4000-8000-000000000009', 'Classic Celebration Buffet', 'Per guest authentic wedding feast with injera, key wot, alicha, and service staff.', 580),
  ('b0000000-0000-4000-8000-000000000009', 'Mels Traditional Banquet', 'Customized traditional menu for the mels day with homemade tej and tela service.', 720),

  -- Decor
  ('b0000000-0000-4000-8000-000000000010', 'Stage Backdrop & Ceremony Arch', 'Custom stage backdrop, floral arch, warm spotlights, and red carpet aisle.', 60000),
  ('b0000000-0000-4000-8000-000000000010', 'Grand Hall Complete Transformation', 'Full ceiling drapery, fairy lights, 30 guest tables styling, and VIP bridal stage.', 150000),
  ('b0000000-0000-4000-8000-000000000011', 'Bridal Floral Suite', 'Bridal bouquet, 4 bridesmaid posies, 6 groomsmen boutonnières in fresh roses.', 18000),
  ('b0000000-0000-4000-8000-000000000011', 'Romantic Reception Florals', 'Fresh floral arch, 25 table centerpieces with candles, and entry arrangements.', 75000),
  ('b0000000-0000-4000-8000-000000000012', 'Mels Cultural Styling', 'Authentic pottery, handwoven Ethiopian textiles, golden brass mesob, and straw mats.', 45000),
  ('b0000000-0000-4000-8000-000000000012', 'Earth & Flora Wedding Package', 'Natural botanical centerpieces, wooden accents, and warm ambient lighting.', 98000),

  -- Music
  ('b0000000-0000-4000-8000-000000000013', '4-Hour Live Band Performance', '8-piece band with brass section, kirar, and vocalists covering classics and eskista.', 55000),
  ('b0000000-0000-4000-8000-000000000013', 'All-Day Wedding & Mels Band', 'Live band performance for reception party plus next day mels celebration.', 95000),
  ('b0000000-0000-4000-8000-000000000014', 'Essential DJ & Sound Package', 'Professional wedding DJ, JBL sound system, wireless mics, and custom playlist.', 32000),
  ('b0000000-0000-4000-8000-000000000014', 'VIP Concert Sound & Light Show', 'Concert sound system, moving-head intelligent lighting, and low-fog dancing on clouds.', 68000),
  ('b0000000-0000-4000-8000-000000000015', 'Bridal Arrival Acoustic Welcome', 'Traditional washint, acoustic krar, and kebero welcoming guests and bridal party.', 25000),
  ('b0000000-0000-4000-8000-000000000015', 'Full Mels Cultural Troupe', '3 hours of traditional azmari songs, cultural instruments, and folk dancers for mels.', 48000),

  -- Cake
  ('b0000000-0000-4000-8000-000000000016', '3-Tier Classic Elegance Cake', 'Serves up to 150 guests. Choice of vanilla bean, chocolate ganache, or strawberry.', 26000),
  ('b0000000-0000-4000-8000-000000000016', '5-Tier Grand Floral Centerpiece', 'Serves 300+ guests with handcrafted sugar flowers and edible 24k gold foil.', 55000),
  ('b0000000-0000-4000-8000-000000000017', 'Modern Minimalist Tiered Cake', 'Clean architectural tiers with textured buttercream, serves up to 120 guests.', 24000),
  ('b0000000-0000-4000-8000-000000000017', 'Luxury Cake & Dessert Bar', '3-tier wedding cake plus macarons, mini eclairs, and tartlets for 200 guests.', 48000),
  ('b0000000-0000-4000-8000-000000000018', 'Heritage 4-Tier Cultural Cake', 'Intricate golden Ethiopian cross and embroidery motifs with spiced chocolate sponge.', 32000),
  ('b0000000-0000-4000-8000-000000000018', 'Royal Cake & Cupcake Favors', '4-tier centerpiece cake plus 100 individual guest favor boxes.', 58000);

-- 3. Insert Portfolio Photos (High resolution, wedding specific)
DELETE FROM public.vendor_portfolio WHERE vendor_id LIKE 'b0000000-0000-4000-8000-%';

INSERT INTO public.vendor_portfolio (vendor_id, image_url, title) VALUES
  -- Photography
  ('b0000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80', 'Golden hour mountain portraits'),
  ('b0000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80', 'Church ceremony and blessings'),
  ('b0000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&auto=format&fit=crop&q=80', 'Editorial bride and groom portraits'),
  ('b0000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80', 'Joyful reception dancing'),
  ('b0000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&auto=format&fit=crop&q=80', 'Sunset romantic portraits'),
  ('b0000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&auto=format&fit=crop&q=80', 'Traditional habesha dress details'),

  -- Venue
  ('b0000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1200&auto=format&fit=crop&q=80', 'Pine forest garden ceremony lawn'),
  ('b0000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop&q=80', 'Evening dinner under festoon lights'),
  ('b0000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop&q=80', 'Grand ballroom crystal chandeliers'),
  ('b0000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&auto=format&fit=crop&q=80', 'Elegantly styled banquet hall'),
  ('b0000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&auto=format&fit=crop&q=80', 'Lakeside wedding ceremony terrace'),
  ('b0000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80', 'Babogaya lake sunset panorama'),

  -- Catering
  ('b0000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&auto=format&fit=crop&q=80', 'Lavish wedding banquet buffet'),
  ('b0000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=1200&auto=format&fit=crop&q=80', 'Traditional spicy stews and injera spread'),
  ('b0000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80', 'Gourmet wedding appetizers'),
  ('b0000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80', 'Traditional jebena coffee ceremony station'),
  ('b0000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80', 'Authentic meat and vegetarian feast platters'),
  ('b0000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80', 'Wedding reception feast table'),

  -- Decor
  ('b0000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&auto=format&fit=crop&q=80', 'Grand stage archway with roses'),
  ('b0000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80', 'Illuminated backdrop and table setting'),
  ('b0000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200&auto=format&fit=crop&q=80', 'Fresh rose and eucalyptus table runner'),
  ('b0000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=1200&auto=format&fit=crop&q=80', 'Candlelit wedding floral centerpieces'),
  ('b0000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&auto=format&fit=crop&q=80', 'Cultural mesob and brass wedding styling'),
  ('b0000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&auto=format&fit=crop&q=80', 'Traditional Ethiopian handwoven decor'),

  -- Music
  ('b0000000-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80', '8-piece live wedding band on stage'),
  ('b0000000-0000-4000-8000-000000000013', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop&q=80', 'Guests celebrating and dancing eskista'),
  ('b0000000-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80', 'Concert DJ setup with pro audio'),
  ('b0000000-0000-4000-8000-000000000014', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80', 'Intelligent wedding dance party lights'),
  ('b0000000-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80', 'Traditional krar and washint acoustic performance'),
  ('b0000000-0000-4000-8000-000000000015', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80', 'Cultural wedding welcome music'),

  -- Cake
  ('b0000000-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1200&auto=format&fit=crop&q=80', '4-tier floral wedding cake with gold leaf'),
  ('b0000000-0000-4000-8000-000000000016', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&auto=format&fit=crop&q=80', 'Artisanal handcrafted sugar flower petals'),
  ('b0000000-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=1200&auto=format&fit=crop&q=80', 'Contemporary architectural wedding cake'),
  ('b0000000-0000-4000-8000-000000000017', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200&auto=format&fit=crop&q=80', 'French pastry & macaron wedding table'),
  ('b0000000-0000-4000-8000-000000000018', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=80', 'Cultural Ethiopian gold motif wedding cake'),
  ('b0000000-0000-4000-8000-000000000018', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1200&auto=format&fit=crop&q=80', 'Spiced honey & cardamom tiered cake');

-- 4. Insert Authentic Couple Reviews
DELETE FROM public.reviews WHERE vendor_id LIKE 'b0000000-0000-4000-8000-%';

INSERT INTO public.reviews (vendor_id, author_name, rating, comment, is_sample) VALUES
  -- Photography
  ('b0000000-0000-4000-8000-000000000001', 'Hanna & Dawit', 5, 'They felt like family by the end of the night. The photos still make our parents cry.', true),
  ('b0000000-0000-4000-8000-000000000001', 'Meron T.', 5, 'Calm, professional, and never in the way during church or reception.', true),
  ('b0000000-0000-4000-8000-000000000002', 'Bethel & Samuel', 5, 'The video highlights brought everyone to tears. Best investment we made.', true),
  ('b0000000-0000-4000-8000-000000000002', 'Liya G.', 4, 'Superb editorial vision and very punctual team.', true),
  ('b0000000-0000-4000-8000-000000000003', 'Ruth & Yared', 5, 'Captured every candid burst of laughter and every tear of joy.', true),
  ('b0000000-0000-4000-8000-000000000003', 'Abel K.', 5, 'Unbelievable attention to detail on our traditional garments.', true),

  -- Venue
  ('b0000000-0000-4000-8000-000000000004', 'Rahel & Abel', 5, 'The sunset view above the clouds was surreal. Our guests could not stop talking about the venue.', true),
  ('b0000000-0000-4000-8000-000000000004', 'Tigist M.', 4, 'Truly magical garden. Excellent on-site manager.', true),
  ('b0000000-0000-4000-8000-000000000005', 'Selam & Nahom', 5, 'Spacious, luxurious, and the acoustics for our live band were incredible.', true),
  ('b0000000-0000-4000-8000-000000000005', 'Kalkidan B.', 5, 'Staff was so attentive and helped our coordinator every step of the way.', true),
  ('b0000000-0000-4000-8000-000000000006', 'Feven & Michael', 5, 'Getting married right at the water edge at sunset was pure magic.', true),
  ('b0000000-0000-4000-8000-000000000006', 'Yonatan D.', 5, 'The best destination wedding choice near Addis. Unforgettable scenery.', true),

  -- Catering
  ('b0000000-0000-4000-8000-000000000007', 'Eden & Fitsum', 5, 'The food was piping hot, delicious, and seasoned to perfection. Our elders gave 10/10.', true),
  ('b0000000-0000-4000-8000-000000000007', 'Girum H.', 5, 'Top-class service brigade. Kept the buffet lines flowing smoothly for 400 people.', true),
  ('b0000000-0000-4000-8000-000000000008', 'Sara & Michael', 5, 'The coffee station with freshly roasted beans was the absolute talk of the reception.', true),
  ('b0000000-0000-4000-8000-000000000008', 'Nardos K.', 4, 'Creative appetizers and super attentive waitstaff.', true),
  ('b0000000-0000-4000-8000-000000000009', 'Martha & Daniel', 5, 'Authentic taste just like homemade food by mother. Generous portions.', true),
  ('b0000000-0000-4000-8000-000000000009', 'Solomon B.', 5, 'Never ran out of food, highly reliable and friendly.', true),

  -- Decor
  ('b0000000-0000-4000-8000-000000000010', 'Mahlet & Yared', 5, 'They transformed an ordinary hall into a royal palace. Our guests took thousands of photos.', true),
  ('b0000000-0000-4000-8000-000000000010', 'Dagmawit S.', 5, 'Flawless execution from concept sketches to wedding day.', true),
  ('b0000000-0000-4000-8000-000000000011', 'Feven & Abenezer', 5, 'The fresh roses smelled heavenly all evening. Exactly as we envisioned.', true),
  ('b0000000-0000-4000-8000-000000000011', 'Helen A.', 5, 'So tasteful and elegant. Avoided all the tacky plastic stuff.', true),
  ('b0000000-0000-4000-8000-000000000012', 'Kalkidan & Natnael', 5, 'The mels setup was the most culturally stunning decor I have ever seen.', true),
  ('b0000000-0000-4000-8000-000000000012', 'Bilen T.', 4, 'Unique, warm aesthetic that made everyone feel at home.', true),

  -- Music
  ('b0000000-0000-4000-8000-000000000013', 'Yodit & Henok', 5, 'The dance floor was packed from 7 PM to midnight! Unbelievable eskista energy!', true),
  ('b0000000-0000-4000-8000-000000000013', 'Dawit W.', 5, 'Played all the classic songs my grandparents loved plus modern bangers.', true),
  ('b0000000-0000-4000-8000-000000000014', 'Semhar & Bereket', 5, 'Henok read the crowd so well. Not a single boring moment.', true),
  ('b0000000-0000-4000-8000-000000000014', 'Kidist M.', 5, 'Crystal clear audio during speeches and insane dance party.', true),
  ('b0000000-0000-4000-8000-000000000015', 'Aster & Tadesse', 5, 'The washint and krar as we entered gave everyone goosebumps.', true),
  ('b0000000-0000-4000-8000-000000000015', 'Haile G.', 5, 'True Ethiopian cultural royalty. Wonderful musicians.', true),

  -- Cake
  ('b0000000-0000-4000-8000-000000000016', 'Bethlehem & Robel', 5, 'Not only was the cake stunning in all our photos, but the red velvet was so moist!', true),
  ('b0000000-0000-4000-8000-000000000016', 'Senait Y.', 5, 'Delivered and set up on time in perfect condition. Masterpiece!', true),
  ('b0000000-0000-4000-8000-000000000017', 'Eyerusalem & Eyob', 5, 'The macaron tower alongside our wedding cake was a massive hit!', true),
  ('b0000000-0000-4000-8000-000000000017', 'Meron A.', 4, 'Sophisticated taste, not overwhelmingly sweet. Just perfect.', true),
  ('b0000000-0000-4000-8000-000000000018', 'Rahel & Ermias', 5, 'The gold cross detailing on our cake was breathtaking. Everyone took photos.', true),
  ('b0000000-0000-4000-8000-000000000018', 'Tsehay N.', 5, 'The spiced honey flavor was so unique and delicious!', true);

-- 5. Auto-grant Admin Privileges to Designated Admin Accounts
-- Updates handle_new_user() trigger so any of these 4 emails signing up automatically get the 'admin' role
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

  -- Auto-grant admin role to designated administrator emails
  IF LOWER(NEW.email) IN (
    'meronmulugeta114@gmail.com',
    'bezawitberhan070@gmail.com',
    'naomikassaye18@gmail.com',
    'zewdiesolyanaalemseged@gmail.com'
  ) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

-- If any of the admin accounts already signed up, ensure their admin role is recorded:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE LOWER(email) IN (
  'meronmulugeta114@gmail.com',
  'bezawitberhan070@gmail.com',
  'naomikassaye18@gmail.com',
  'zewdiesolyanaalemseged@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;

