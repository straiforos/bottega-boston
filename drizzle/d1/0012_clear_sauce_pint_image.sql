-- Remove sauce-pint studio imagery from "Sauces by The Pint" (list stays text-only).
UPDATE menu_items
SET image_url = NULL,
    image_variants = NULL
WHERE id = 'dish-40';
