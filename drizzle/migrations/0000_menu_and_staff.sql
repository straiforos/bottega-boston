CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.staff_allowlist (
  email text PRIMARY KEY CHECK (email = lower(email)),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.staff_allowlist TO service_role;
ALTER TABLE public.staff_allowlist ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.grant_staff_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.staff_allowlist WHERE email = lower(NEW.email)) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_staff
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_staff_role();
CREATE TRIGGER on_auth_user_updated_grant_staff
AFTER UPDATE OF email_confirmed_at, email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_staff_role();

-- When an email is added to the allowlist later, grant existing confirmed accounts
CREATE OR REPLACE FUNCTION public.grant_staff_role_on_allow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, 'admin' FROM auth.users u
  WHERE lower(u.email) = NEW.email AND u.email_confirmed_at IS NOT NULL
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_staff_allowlist_insert
AFTER INSERT ON public.staff_allowlist FOR EACH ROW EXECUTE FUNCTION public.grant_staff_role_on_allow();

CREATE TABLE public.menu_sections (
  id text PRIMARY KEY,
  name text NOT NULL,
  note text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.menu_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_sections TO authenticated;
GRANT ALL ON public.menu_sections TO service_role;
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads sections" ON public.menu_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write sections" ON public.menu_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.menu_items (
  id text PRIMARY KEY DEFAULT ('dish-' || gen_random_uuid()::text),
  section_id text NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  price text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_items_section_idx ON public.menu_items(section_id, sort_order);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads dishes" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write dishes" ON public.menu_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));