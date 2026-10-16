CREATE OR REPLACE FUNCTION public.block_unlisted_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IS NULL OR NOT EXISTS (SELECT 1 FROM public.staff_allowlist WHERE email = lower(NEW.email)) THEN
    RAISE EXCEPTION 'This account is not on the Bottega staff list';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER before_auth_user_insert_allowlist
BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.block_unlisted_signup();

CREATE POLICY "Anyone reads menu images" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'menu-images');
CREATE POLICY "Admins upload menu images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update menu images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete menu images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'menu-images' AND public.has_role(auth.uid(), 'admin'));