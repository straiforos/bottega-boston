-- Ensure hero.imageUrl is set (0014 may not have landed on every env).
INSERT INTO home_content (key, data, updated_at)
VALUES (
  'hero',
  '{"imageUrl":"/media/gallery-media/home-hero/1794657982060-hq.webp"}',
  datetime('now')
)
ON CONFLICT(key) DO UPDATE SET
  data = json_patch(
    CASE WHEN json_valid(data) THEN data ELSE '{}' END,
    '{"imageUrl":"/media/gallery-media/home-hero/1794657982060-hq.webp"}'
  ),
  updated_at = datetime('now');
