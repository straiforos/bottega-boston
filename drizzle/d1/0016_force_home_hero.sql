-- Replace hero row so imageUrl is definitely present for Worker SSR (no code fallback).
DELETE FROM home_content WHERE key = 'hero';
INSERT INTO home_content (key, data, updated_at)
VALUES (
  'hero',
  json_object(
    'imageUrl', '/media/gallery-media/home-hero/1794657982060-hq.webp',
    'imageAlt', 'A woman in sunglasses eating Bottega pasta at a marble table under the #PASTA IS LIFE neon',
    'headline', '#PASTAISLIFE',
    'showStamp', json('true'),
    'stamp', 'Buona' || char(10) || 'Semplice' || char(10) || 'Italian.'
  ),
  datetime('now')
);
