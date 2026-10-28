-- Holiday events from the Lovable production calendar (one-offs, America/New_York).
-- Images were imported from Supabase gallery-media into R2 bottega-media.
INSERT OR IGNORE INTO events (
  id, title, description, location_id, locations, image_url,
  starts_at, duration_minutes, ticket_url, published, recurrence, timezone
) VALUES
  (
    'a1b2c3d4-e5f6-4789-a012-111111111111',
    'Halloween',
    'Bring your best costume and join us on Halloween!',
    'brookline',
    '["brookline"]',
    '/media/gallery-media/event-1792266180046/1792266180046-standard.webp',
    '2026-10-31T15:00:00.000Z',
    120,
    NULL,
    1,
    NULL,
    'America/New_York'
  ),
  (
    'a1b2c3d4-e5f6-4789-a012-222222222222',
    'Thanksgiving',
    'Bring your friends and family by on Thanksgiving Day for a celebratory feast!',
    'brookline',
    '["brookline"]',
    '/media/gallery-media/event-1792267707627/1792267707627-standard.webp',
    '2026-11-26T16:00:00.000Z',
    120,
    NULL,
    1,
    NULL,
    'America/New_York'
  ),
  (
    'a1b2c3d4-e5f6-4789-a012-333333333333',
    'Christmas',
    'Happy Holidays to all of our fans! Join us with family and friends!',
    'brookline',
    '["brookline"]',
    '/media/gallery-media/event-1792267868238/1792267868238-standard.webp',
    '2026-12-25T16:00:00.000Z',
    120,
    NULL,
    1,
    NULL,
    'America/New_York'
  ),
  (
    'a1b2c3d4-e5f6-4789-a012-444444444444',
    'NEW YEAR''S EVE',
    'Celebrate the New Year with us and join us on New Year''s Eve!',
    'brookline',
    '["brookline","boston"]',
    '/media/gallery-media/event-1792268121093/1792268121093-standard.webp',
    '2026-12-31T16:00:00.000Z',
    120,
    NULL,
    1,
    NULL,
    'America/New_York'
  );
