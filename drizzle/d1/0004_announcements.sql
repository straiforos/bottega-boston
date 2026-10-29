CREATE TABLE announcements (
  id text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text,
  href text,
  link_label text,
  starts_at text NOT NULL,
  ends_at text NOT NULL,
  published integer NOT NULL DEFAULT 1,
  created_at text NOT NULL DEFAULT (datetime('now')),
  updated_at text NOT NULL DEFAULT (datetime('now'))
);
