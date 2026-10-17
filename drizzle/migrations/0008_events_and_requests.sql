CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location_id text NOT NULL DEFAULT 'brookline',
  image_url text,
  starts_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 120,
  ticket_url text,
  published boolean NOT NULL DEFAULT true,
  recurrence jsonb,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads published events" ON public.events FOR SELECT TO anon, authenticated
  USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins write events" ON public.events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.event_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  occurrence_date date NOT NULL,
  skipped boolean NOT NULL DEFAULT false,
  start_time text,
  ticket_url text,
  UNIQUE (event_id, occurrence_date)
);
GRANT SELECT ON public.event_exceptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_exceptions TO authenticated;
GRANT ALL ON public.event_exceptions TO service_role;
ALTER TABLE public.event_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads event exceptions" ON public.event_exceptions FOR SELECT TO anon, authenticated USING (
  EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.published OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Admins write event exceptions" ON public.event_exceptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.event_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  location_id text NOT NULL DEFAULT '',
  requested_for timestamptz NOT NULL,
  guests integer,
  event_type text NOT NULL DEFAULT '',
  fulfillment text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  dietary text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  order_lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'new',
  staff_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_requests_kind_check CHECK (kind IN ('catering', 'space')),
  CONSTRAINT event_requests_status_check CHECK (status IN ('new', 'quoted', 'booked', 'declined'))
);
CREATE INDEX event_requests_email_created_idx ON public.event_requests (email, created_at);
GRANT SELECT, UPDATE, DELETE ON public.event_requests TO authenticated;
GRANT ALL ON public.event_requests TO service_role;
ALTER TABLE public.event_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage requests" ON public.event_requests FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));