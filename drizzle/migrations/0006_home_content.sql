CREATE TABLE public.home_content (
  key text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.home_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.home_content TO authenticated;
GRANT ALL ON public.home_content TO service_role;
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads home content" ON public.home_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write home content" ON public.home_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));