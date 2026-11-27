-- Point home hero at the surviving staff upload in R2 (bucket bottega-media).
-- App serves it as /media/<key>; do not use the clobberable bundled a/v1 hero.png key.
INSERT INTO home_content (key, data, updated_at)
VALUES (
  'hero',
  json_object(
    'imageUrl',
    '/media/gallery-media/home-hero/1794657982060-hq.webp'
  ),
  datetime('now')
)
ON CONFLICT(key) DO UPDATE SET
  data = json_set(
    COALESCE(data, '{}'),
    '$.imageUrl',
    '/media/gallery-media/home-hero/1794657982060-hq.webp'
  ),
  updated_at = datetime('now');
