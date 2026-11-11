UPDATE public.menu_items 
SET image_url = '/menu-images/' || id || '/studio.jpg'
WHERE id LIKE 'dish-%';