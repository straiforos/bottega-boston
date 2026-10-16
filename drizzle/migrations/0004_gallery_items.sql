CREATE TABLE public.gallery_items (
  id text PRIMARY KEY DEFAULT ('tile-' || gen_random_uuid()::text),
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  asset_key text,
  media_url text,
  poster_url text,
  variants jsonb,
  alt text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT ALL ON public.gallery_items TO service_role;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads gallery" ON public.gallery_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write gallery" ON public.gallery_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.gallery_items (id, media_type, asset_key, alt, caption, sort_order) VALUES
  ('tile-video', 'video', 'social-video', 'A moment at Bottega', '', 0),
  ('tile-1', 'image', 'social-1', 'Enjoying a sweet treat at Bottega', 'La dolce vita', 1),
  ('tile-2', 'image', 'social-2', 'A Bottega guest sharing a plate of pasta', '#pastaislife', 2),
  ('tile-3', 'image', 'social-3', 'Coffee and a little work at Bottega', 'Caffè, always', 3);

CREATE POLICY "Anyone reads gallery media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'gallery-media');
CREATE POLICY "Admins upload gallery media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update gallery media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete gallery media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery-media' AND public.has_role(auth.uid(), 'admin'));