-- Remove topping-tray studio imagery from catering sides (list stays text-only).
UPDATE menu_items
SET image_url = NULL,
    image_variants = NULL
WHERE id IN ('dish-80', 'dish-81');
