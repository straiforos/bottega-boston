INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-0','Coffee & Tea','Make it with oat milk +$2.08',0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-0','category-0','Espresso','$3.10','','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-1','category-0','Doppio Espresso','$3.90','','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-2','category-0','Macchiato','$4.15','','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-3','category-0','Americano','$4.25 (Small) | $4.75 (Grande)','','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-4','category-0','Cappuccino','$4.75 (Small) | $5.25 (Grande)','','{}'::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-5','category-0','Caffe & Latte','$4.75 (Small) | $5.25 (Grande)','','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-6','category-0','Tea','$3.64 (Small) | $4.16 (Grande)','','{}'::text[],6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-7','category-0','Iced Americano','$4.75','','{}'::text[],7);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-8','category-0','Iced Caffe & Latte','$5.25','','{}'::text[],8);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-1','Breakfast','All Panini & Dolci available for breakfast.',1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-9','category-1','Plain Frittata','$6.25','Plain topped with arugula.',ARRAY['GF','V']::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-10','category-1','Sausage & Ricotta Frittata','$7.00','Sausage & ricotta & pesto.',ARRAY['GF']::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-11','category-1','Ham & Cheese Frittata','$7.00','Add Prosciutto +$2.08 | Add Mozzarella +$2.08',ARRAY['GF']::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-12','category-1','Sfogliatelle','$8.25','Cheese, Spinach & Zucchini (V) | Ham & Asiago cheese topped with rosemary.','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-13','category-1','Breakfast Bruschetta','$6.25','Lightly-toasted Toscano bread with garlic, plain frittata over mixed greens with fresh chopped tomato, dressed with basil, Italian spices and E.V.O.O • Add Prosciutto +$2.00 | Add Mozzarella +$2.00',ARRAY['V']::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-14','category-1','Bruschetta Dolce (Sweet)','$6.75','Lightly-toasted Toscano bread with cinnamon ricotta, topped with fresh fruit, Nutella drizzle and basil.',ARRAY['V']::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-15','category-1','Breakfast Panini','$7.50','Lightly toasted Toscano bread with eggs and Provolone cheese','{}'::text[],6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-16','category-1','Sflogiatelle Ham and cheese','$8.25','Puff pastry filled with ham and asiago cheese.','{}'::text[],7);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-2','Antipasti (Appetizers)','',2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-17','category-2','Bruschetta','$4.70','Lightly-toasted Toscano bread with garlic, fresh chopped tomato, dressed with basil, Italian spices and E.V.O.O • Add Prosciutto +$2.08 | Add Mozzarella +$2.08',ARRAY['VG']::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-18','category-2','Sfogliatelle Spinach','$8.25','Puff pastry filled with asiago cheese, spinach and zucchini (V)','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-19','category-2','Crocchetta Di Pollo','$4.70','Crispy potato and chicken croquette.','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-20','category-2','Sausage Arancini','$5.75','Crispy rice ball filled with pomodoro sauce, cheese with Italian sausage.','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-21','category-2','Sfogliatelle Ham and Cheese','$8.25','Puff pastry filled with ham and asiago cheese','{}'::text[],4);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-3','Insalate (Salads)','Vinaigrettes & Dressings: Olive Oil | Vinegar | Balsamic Vinegar | Lemon Olive Oil | Caesar | Italian',3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-22','category-3','Caprese','$16.00','Mixed greens with fresh tomato and mozzarella with basil, dressed with balsamic glaze and E.V.O.O.',ARRAY['GF','V']::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-23','category-3','Cesare','$14.00','Romaine lettuce, anchovies, croutons, and shaved parmigiano with Caesar dressing.','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-24','category-3','Toscana','$14.00','Mixed greens, sun-dried tomato, artichokes, roasted peppers and mushrooms with balsamic vinaigrette.',ARRAY['GF','VG']::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-25','category-3','Pear & Parmigiano','$14.00','Arugula, pear, shaved parmigiano topped with walnuts dressed with lemon olive oil vinaigrette.',ARRAY['GF','V']::text[],3);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-4','Al Forno (Baked & More)','',4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-26','category-4','Parmigiana Di Melanzane','$13.50','Baked layers of eggplant, tomato sauce and parmigiano.',ARRAY['GF','V']::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-27','category-4','Lasagna','$13.50','Baked layers of pasta, bechamel, cheese and bolognese sauce.','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-28','category-4','Chicken Parmigiana','$16.50','Crispy chicken breast breaded and seasoned topped with parmigiano cheese over pomodoro sauce.','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-29','category-4','Soup of the Day','$8.00','Ask us for today''s special.','{}'::text[],3);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-5','Panini (Sandwiches)','',5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-30','category-5','Bottega','$16.25','Prosciutto, sorpressata, mozzarella, roasted pepper and E.V.O.O.','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-31','category-5','Italiano','$15.25','Salame, sorpressata, mortadella, provolone, cheese, onions, lettuce, tomato, pickles, hots with vinegar and E.V.O.O.','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-32','category-5','Polpette','$15.25','Meatballs with tomato sauce and parmigiano cheese • Add Provolone +$2.00 | Add Mozzarella +$3.00','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-33','category-5','Roast Beef','$15.25','With caramelized onions, provolone cheese, lightly dressed arugula on Toscano bread.','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-34','category-5','Caprese','$13.25','Fresh mozzarella, tomato, basil and E.V.O.O | Add Prosciutto +$3.12',ARRAY['V']::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-35','category-5','Tacchino','$16.25','Turkey with crispy pancetta, fresh tomato, lightly dressed mixed greens and pesto-mayo.','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-36','category-5','Melanzane','$15.25','Crispy breaded eggplant, fresh tomato, fresh mozzarella, lightly dressed mix greens with sundried tomato-ricotta smear.',ARRAY['V']::text[],6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-37','category-5','Chicken Parmigiana','$17.25','Breaded and fried chicken breast with tomato sauce and provolone cheese.','{}'::text[],7);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-38','category-5','Morta - Della','$15.25','With fresh mozzarella, pesto, toasted pistachio, lemon zest on house focaccia.','{}'::text[],8);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-6','Pasta','All house sauces are Gluten Free.',6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-39','category-6','Build Your Own Pasta Bowl','$11.75+','Choose pasta shape, choose a house sauce, lastly add toppings.

Pasta Shapes: Penne, Spaghetti or Fettuccine ($11.75) | Gluten Free (GF) ($13.75) | Gnocchi ($14.75) | Cheese Tortellini ($15.75) | Lobster Ravioli ($19.00)
Traditional Sauces:
Pomodoro (VG): Fresh tomato and basil | Make It Spicy, Add Pepperoncino
Fedora (V): Pomodoro, rosemary and cream.
Alfredo: Butter, cheese, cream and black pepper.
Vodka (V): Creamy pink sauce with vodka and a touch of butter.
Creamy Carbonara (+$2.15): Egg, cheese, cream, pancetta, onion and black pepper.
Bolognese (+$2.15): Ground beef and pork cooked in pomodoro.
Pesto (V) (+$2.15): Fresh basil, parmigiano cheese, E.V.O.O, garlic and pine nuts.
Bottega Sauces (+$3.25 each):
Andrea: Prosciutto, sweetpeas, mushroom, and cream sprinkled with truffle oil.
Michelangelo (V): Fresh tomato, basil, and fresh mozzarella.
Pesce: Shrimps, scallops, sundried tomato, white wine and thyme.
Medici: Prosciutto, mushroom in creamy pomodoro.
Gorgonzola: Creamy gorgonzola with a touch of nutmeg.
Seasonal Sauces: Fettuccine Primavera (V) (+$3.25) - Mushroom, broccoli, carrots, peppers, celery and onions | Only available during spring and summer.
Toppings: Grilled Chicken +$4.90 | Roasted Sausage +$4.90 | Shrimps +$4.90 | Meatball (One) +$3.00 | Fresh Mozzarella +$3.00 | Broccoli +$2.45 | Mushrooms +$2.45 | Roasted Peppers +$2.45 | Pancetta +$3.95 | Prosciutto +$3.95','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-40','category-6','Sauces by The Pint','$11.00+','','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-41','category-6','Pumpkin Tortellone','$15.00','',ARRAY['V']::text[],2);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-7','Dolci (Sweets)','',7);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-42','category-7','Tiramisu','$7.55','Layers of ladyfingers soaked in espresso coffee and silky mascarpone cream sprinkled with cacao powder.','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-43','category-7','Bread Pudding','$6.75','Italian style bread pudding with panettone.','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-44','category-7','Cannoli','Mini $3.50 | Traditional $5.45','Traditional Sicilian shells filled with lush ricotta cream and chocolate chips.','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-45','category-7','Cannolo Di Nutella','$5.45','Mille foglie filled with Nutella.','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-46','category-7','Nuvole (Clouds)','$7.80','Soft brioche bread filled with the fluffiest whipped vanilla cream and topped with: Pistacchio | Nocciola (Hazelnut) | Nutella.','{}'::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-47','category-7','Cannolo Di Pistachio','$5.45','Puff pastry filled with pistachio cream.','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-48','category-7','Triple Chocolate cake','$6.75','','{}'::text[],6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-49','category-7','Italian cookie','$1.82','Cookie sandwich filled with raspberry jam.','{}'::text[],7);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-50','category-7','Limoncello Cake','$6.75','Limoncello and mascarpone cheese cake.','{}'::text[],8);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-8','Catering · Insalate (Serves 14-16)','',8);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-51','category-8','Cesare','$140.00','','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-52','category-8','Toscana','$140.00','',ARRAY['GF','VG']::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-53','category-8','Pear & Parmigiano','$140.00','',ARRAY['GF','V']::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-54','category-8','Caprese','$160.00','','{}'::text[],3);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-9','Catering · Al Forno (Serves 8-12)','',9);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-55','category-9','Parmigiana Di Melanzane','$85.00','',ARRAY['GF','V']::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-56','category-9','Lasagna*','$85.00','','{}'::text[],1);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-10','Catering · Pasta Trays (Serves 12-15)','Base Shapes: Penne | Spaghetti | Fettuccine. Gluten Free +$30.00 | Cheese Tortellini +$50.00',10);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-57','category-10','Pomodoro','$125.00','',ARRAY['VG']::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-58','category-10','Fedora','$125.00','',ARRAY['V']::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-59','category-10','Vodka','$125.00','',ARRAY['V']::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-60','category-10','Creamy Carbonara*','$145.00','','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-61','category-10','Alfredo','$125.00','',ARRAY['V']::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-62','category-10','Amatricciana*','$145.00','','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-63','category-10','Bolognese*','$145.00','','{}'::text[],6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-64','category-10','Michelangelo','$155.00','',ARRAY['V']::text[],7);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-65','category-10','Andrea*','$155.00','','{}'::text[],8);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-66','category-10','Pesto','$145.00','',ARRAY['V']::text[],9);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-67','category-10','Arrabiatta','$125.00','','{}'::text[],10);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-68','category-10','Medici','$155.00','','{}'::text[],11);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-69','category-10','Pesce','$155.00','','{}'::text[],12);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-70','category-10','Gorgonzola','$155.00','','{}'::text[],13);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-11','Catering · Panini / Sandwiches Trays','All panini cut in halves (thirds per request) | Add Chips +$1.00 each',11);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-71','category-11','Bottega*','$16.00','','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-72','category-11','Roast Beef','$15.00','','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-73','category-11','Melanzane','$15.00','',ARRAY['V']::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-74','category-11','Italiano*','$15.00','','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-75','category-11','Caprese','$13.00 (Add Prosciutto +$2.00)','',ARRAY['V']::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-76','category-11','Chicken Parmigiana','$16.50','','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-77','category-11','Polpette','$15.00 (Add Provolone/Mozzarella +$2.00)','','{}'::text[],6);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-78','category-11','Tacchino*','$16.00','','{}'::text[],7);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-79','category-11','Morta - Della*','$15.00','','{}'::text[],8);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-12','Catering · Toppings / Sides Trays','',12);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-80','category-12','Chicken, sausage & meatballs','Chicken $4.68 | Sausage $4.68 | Meatballs $2.86 each','Grill Chicken | Roasted Sausage | Meatballs','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-81','category-12','Veggies','$2.34','Broccoli, Mushroom, Roasted Pepper','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-82','category-12','House Foccacia','$36.00–$60.00','Rosemary and Salt $36.00 | Pesto Provolone $60.00 | Gorgonzola $60.00 | Sundried Tomato and Olives $60.00','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-83','category-12','Bruschetta Bites','$2.99/each (min 10)','','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-84','category-12','Sfogliatelle (Spinach/Zucchini or Ham/Asiago)','$4.06','','{}'::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-85','category-12','Chicken croquette bites','$3.00','','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-86','category-12','Sausage arancini bites','$3.50','','{}'::text[],6);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-13','Catering · Breakfast Catering','',13);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-87','category-13','Breakfast panini','$6.50','','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-88','category-13','Breakfast Bruschetta','$6.50','','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-89','category-13','Plain Frittata','$6.00','','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-90','category-13','Sausage and Ricotta Frittata','$6.75','','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-91','category-13','Ham and Cheese Frittata','$6.75','','{}'::text[],4);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-92','category-13','HOT BLACK COFFEE (Serves 16)','$31.20','','{}'::text[],5);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-93','category-13','ICE BLACK COFFEE (Serves 16)','$31.20','','{}'::text[],6);
INSERT INTO public.menu_sections (id,name,note,sort_order) VALUES ('category-14','Catering · Dolci / Sweet Trays','',14);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-94','category-14','Tiramisu Tray (Serves 12-15)','$91.26','','{}'::text[],0);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-95','category-14','Cannoli Box','Mini $3.25 | Traditional $5.25','','{}'::text[],1);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-96','category-14','Cannolo Nutella','$5.25','','{}'::text[],2);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-97','category-14','Nutole','$7.50','','{}'::text[],3);
INSERT INTO public.menu_items (id,section_id,name,price,description,tags,sort_order) VALUES ('dish-98','category-14','Bread pudim','$6.50','','{}'::text[],4);