-- Bottega D1 schema (SQLite). No auth/storage schemas, RLS, or auth.users triggers.
-- Staff access is enforced in the Worker via staff_allowlist.

CREATE TABLE staff_allowlist (
  email text PRIMARY KEY CHECK (email = lower(email)),
  created_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE menu_sections (
  id text PRIMARY KEY,
  name text NOT NULL,
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE menu_items (
  id text PRIMARY KEY,
  section_id text NOT NULL REFERENCES menu_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  price text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags text NOT NULL DEFAULT '[]',
  image_url text,
  image_variants text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at text NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX menu_items_section_idx ON menu_items(section_id, sort_order);

CREATE TABLE gallery_items (
  id text PRIMARY KEY,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  asset_key text,
  media_url text,
  poster_url text,
  variants text,
  alt text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at text NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO gallery_items (id, media_type, asset_key, alt, caption, sort_order) VALUES
  ('tile-video', 'video', 'social-video', 'A moment at Bottega', '', 0),
  ('tile-1', 'image', 'social-1', 'Enjoying a sweet treat at Bottega', 'La dolce vita', 1),
  ('tile-2', 'image', 'social-2', 'A Bottega guest sharing a plate of pasta', '#pastaislife', 2),
  ('tile-3', 'image', 'social-3', 'Coffee and a little work at Bottega', 'Caffè, always', 3);

CREATE TABLE club_subscribers (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  consent_at text NOT NULL DEFAULT (datetime('now')),
  unsubscribe_token text NOT NULL UNIQUE,
  unsubscribed_at text,
  welcome_sent_at text,
  status text NOT NULL DEFAULT 'active',
  created_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE email_templates (
  key text PRIMARY KEY,
  subject text NOT NULL DEFAULT '',
  preheader text NOT NULL DEFAULT '',
  blocks text NOT NULL DEFAULT '[]',
  kind text NOT NULL DEFAULT 'newsletter',
  name text NOT NULL DEFAULT '',
  variables text NOT NULL DEFAULT '[]',
  updated_at text NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO email_templates (key, kind, name, subject, preheader, variables, blocks) VALUES
('newsletter-starter', 'newsletter', 'Newsletter starter', 'News from Bottega', 'What''s cooking this month', '[]',
 '[{"id":"n1","type":"headline","text":"What''s cooking"},{"id":"n2","type":"text","text":"Ciao! Here''s what''s new at Bottega this month."},{"id":"n3","type":"divider"},{"id":"n4","type":"text","text":"Tell your story here."},{"id":"n5","type":"button","label":"Order now","url":"/#locations"}]'),
('catering-confirmation', 'catering', 'Catering confirmation', 'Your Bottega catering request', 'We got your order, {{guest_name}}', '["guest_name","event_date","guest_count"]',
 '[{"id":"c1","type":"headline","text":"Grazie, {{guest_name}}!"},{"id":"c2","type":"text","text":"We received your catering request for **{{event_date}}** ({{guest_count}} guests). Our team will be in touch shortly to confirm the details."},{"id":"c3","type":"marquee","text":"Pasta is life"},{"id":"c4","type":"text","text":"See you soon,\nThe Bottega family"}]');

CREATE TABLE email_campaigns (
  id text PRIMARY KEY,
  subject text NOT NULL,
  preheader text NOT NULL DEFAULT '',
  blocks text NOT NULL DEFAULT '[]',
  recipient_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  sent_by text,
  sent_at text,
  status text NOT NULL DEFAULT 'sent',
  scheduled_for text,
  updated_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE email_sends (
  id text PRIMARY KEY,
  campaign_id text REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id text REFERENCES club_subscribers(id) ON DELETE SET NULL,
  template_key text,
  email text NOT NULL,
  resend_id text UNIQUE,
  status text NOT NULL DEFAULT 'sent',
  opened_at text,
  clicked_at text,
  created_at text NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX email_sends_campaign_idx ON email_sends(campaign_id);

CREATE TABLE email_events (
  id text PRIMARY KEY,
  delivery_id text NOT NULL UNIQUE,
  resend_id text NOT NULL,
  type text NOT NULL,
  url text,
  occurred_at text NOT NULL DEFAULT (datetime('now')),
  created_at text NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX email_events_resend_idx ON email_events(resend_id);

CREATE TABLE home_content (
  key text PRIMARY KEY,
  data text NOT NULL DEFAULT '{}',
  updated_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE events (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location_id text NOT NULL DEFAULT 'brookline',
  locations text NOT NULL DEFAULT '[]',
  image_url text,
  starts_at text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 120,
  ticket_url text,
  published integer NOT NULL DEFAULT 1,
  recurrence text,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at text NOT NULL DEFAULT (datetime('now')),
  updated_at text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE event_exceptions (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  occurrence_date text NOT NULL,
  skipped integer NOT NULL DEFAULT 0,
  start_time text,
  ticket_url text,
  UNIQUE (event_id, occurrence_date)
);

CREATE TABLE event_requests (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('catering', 'space')),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  location_id text NOT NULL DEFAULT '',
  requested_for text NOT NULL,
  guests integer,
  event_type text NOT NULL DEFAULT '',
  fulfillment text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  dietary text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  order_lines text NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'quoted', 'booked', 'declined')),
  staff_notes text NOT NULL DEFAULT '',
  created_at text NOT NULL DEFAULT (datetime('now')),
  updated_at text NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX event_requests_email_created_idx ON event_requests (email, created_at);
