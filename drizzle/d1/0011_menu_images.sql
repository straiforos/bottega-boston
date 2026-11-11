UPDATE menu_items 
SET image_url = '/media/menu-images/' || id || '/studio.jpg'
WHERE id LIKE 'dish-%';