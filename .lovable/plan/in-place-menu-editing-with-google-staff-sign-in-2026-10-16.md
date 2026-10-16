# In-place menu editing with Google staff sign-in

## What you will get
- A small "Staff sign in" link in the footer. It opens Google sign-in.
- Only emails on an approved staff list are let in. Anyone else gets a polite "This account isn't on the staff list" message and is signed straight back out. Nobody can sign themselves up.
- Once signed in, the regular /menu page turns editable. There is no separate dashboard:
  - Each dish shows small Edit and Delete buttons. Edit opens an inline form for name, price, description and photo.
  - Each section gets an "Add dish" button.
  - Photo upload replaces the dish photo.
- The footer link changes to "Signed in as ... · Sign out" while signed in.
- Visitors see the same menu as today, now loaded live so edits show up right away.

## Needed from you
- The staff email addresses that should be allowed in. I'll ask for them when I build this.

## Steps
1. Turn on Lovable Cloud and enable Google sign-in.
2. Create menu storage (sections, dishes) and copy in all 99 current dishes and their photos, so the live menu matches today's.
3. Add the staff email list and admin roles. Approved emails get admin on sign-in; other emails are refused.
4. Switch /menu to read from storage, keeping search, layout and styling exactly the same.
5. Add the edit, add, delete and photo-upload controls on /menu, visible to admins only, built from Bottega components (Button, TextField, Card, Stamp-free).
6. Add the footer staff link and sign-in/out state.
7. Tests for the rules: non-listed emails are denied, and only admins can save changes.

## Technical details
- Tables: `menu_sections`, `menu_items` (name, price text, description, image_url, sort order), `staff_allowlist(email)`, `user_roles` + `has_role()` security-definer function, per the roles guidance. GRANTs + RLS: public SELECT on menu tables to anon; INSERT/UPDATE/DELETE only when `has_role(auth.uid(),'admin')`.
- Trigger on `auth.users` insert/confirm: grant `admin` only if the verified email is in `staff_allowlist`. Client checks role after OAuth; when absent, shows the refusal message and signs out. Allowlist is never readable by anon.
- Seed migration with literal INSERTs generated from `src/lib/menu-data.ts`; dish images uploaded to a public `menu-images` bucket, admin-only write policies on `storage.objects`.
- Google via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/menu" })` + `configure_social_auth`. Single root `onAuthStateChange` listener in `__root.tsx`.
- Writes go through `createServerFn` with `requireSupabaseAuth` plus an admin role check; public read via a publishable-key server fn so `/menu` keeps SSR and its metadata.
- New code: `src/features/menu/admin/` (editor form, controls), `src/hooks/useStaffSession.ts`, `src/lib/menu.functions.ts`, copy in `src/content/en`. `menu-data.ts` remains only as the seed source. Bottega tokens only; no vendor edits. Record the data/auth architecture rule in `AGENTS.md`.
