ALTER TABLE public.email_templates
  ADD COLUMN kind text NOT NULL DEFAULT 'newsletter',
  ADD COLUMN name text NOT NULL DEFAULT '',
  ADD COLUMN variables text[] NOT NULL DEFAULT '{}';
UPDATE public.email_templates SET kind = 'welcome', name = 'Welcome email' WHERE key = 'welcome';

INSERT INTO public.email_templates (key, kind, name, subject, preheader, variables, blocks) VALUES
('newsletter-starter', 'newsletter', 'Newsletter starter', 'News from Bottega', 'What''s cooking this month', '{}',
 '[{"id":"n1","type":"headline","text":"What''s cooking"},{"id":"n2","type":"text","text":"Ciao! Here''s what''s new at Bottega this month."},{"id":"n3","type":"divider"},{"id":"n4","type":"text","text":"Tell your story here."},{"id":"n5","type":"button","label":"Order now","url":"https://direct.chownow.com/order/18964/locations/27186"}]'),
('catering-confirmation', 'catering', 'Catering confirmation', 'Your Bottega catering request', 'We got your order, {{guest_name}}', '{guest_name,event_date,guest_count}',
 '[{"id":"c1","type":"headline","text":"Grazie, {{guest_name}}!"},{"id":"c2","type":"text","text":"We received your catering request for **{{event_date}}** ({{guest_count}} guests). Our team will be in touch shortly to confirm the details."},{"id":"c3","type":"marquee","text":"Pasta is life"},{"id":"c4","type":"text","text":"See you soon,\nThe Bottega family"}]')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.email_campaigns
  ADD COLUMN status text NOT NULL DEFAULT 'sent',
  ADD COLUMN scheduled_for timestamptz,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.email_campaigns ALTER COLUMN sent_at DROP NOT NULL, ALTER COLUMN sent_at DROP DEFAULT;

ALTER TABLE public.club_subscribers ADD COLUMN status text NOT NULL DEFAULT 'active';
UPDATE public.club_subscribers SET status = 'unsubscribed' WHERE unsubscribed_at IS NOT NULL;

CREATE TABLE public.email_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid REFERENCES public.club_subscribers(id) ON DELETE SET NULL,
  template_key text,
  email text NOT NULL,
  resend_id text UNIQUE,
  status text NOT NULL DEFAULT 'sent',
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_sends_campaign_idx ON public.email_sends(campaign_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_sends TO authenticated;
GRANT ALL ON public.email_sends TO service_role;
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage email sends" ON public.email_sends FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.email_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text NOT NULL UNIQUE,
  resend_id text NOT NULL,
  type text NOT NULL,
  url text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_events_resend_idx ON public.email_events(resend_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_events TO authenticated;
GRANT ALL ON public.email_events TO service_role;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read email events" ON public.email_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));