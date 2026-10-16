# Pasta Club emails with Resend

## What guests get
- The Pasta Club form saves the email for real (no more opening the mail app). Success and "already subscribed" messages show right in the form.
- A Bottega-styled welcome email is sent automatically right after signup.
- Every email has a one-click unsubscribe link that leads to a simple Bottega "You're off the list" page.

## What staff get (inline, no dashboard)
- When signed in, the Pasta Club section on the home page shows a red "Pasta Club emails" ribbon with the subscriber count, **Compose email**, **Edit welcome email** and **Download list (CSV)**.
- **Composer (WYSIWYG):** a split view with editable blocks on the left and a live preview on the right, styled exactly like the sent email:
  - Blocks: headline, text (bold, italic, links), photo (same upload and resize as the gallery), button (label + link), divider/marquee strip.
  - Add, reorder (same arrow buttons as the gallery) and delete blocks.
  - Subject line and preview text fields.
  - **Send test to me**, then **Send to all subscribers** behind a confirmation ("Send to 128 subscribers?").
  - Past sends listed with date, subject and recipient count.
- **Welcome email editor:** same composer, saved as the default template; a default Bottega welcome ships ready to use.

## Email look
Cream background, forest header with the Bottega logo, Barlow-style headlines (with safe fallback fonts for email clients), mustard pill buttons, tomato hairlines — built from the design system's colors, laid out for email clients and phones.

## Setup needed from you
- Connect **Resend** (connect card in chat).
- Verify a sending domain in Resend (for example bottegadelights.com) so emails reach guests; until then, only test sends to the Resend account owner work.
- Free tier: 3,000 emails/month, 100/day. Larger lists need the $20/mo plan.

## Technical details
- Tables: `club_subscribers` (email unique, consent_at, unsubscribe_token, unsubscribed_at), `email_templates` (key 'welcome', subject, preheader, blocks jsonb), `email_campaigns` (subject, blocks, sent_at, recipient_count, sent_by). RLS: admins only via has_role; no public read. Seed the default welcome template in the migration.
- Public signup: `createServerFn` without auth, validates with zod, inserts via admin client inside handler, then sends the welcome email via the Resend gateway (`connector-gateway.lovable.dev/resend/emails`) server-side. Duplicate emails return a friendly status without revealing anything else.
- Unsubscribe: server route `/api/public/unsubscribe?token=…` plus `List-Unsubscribe` header; page route `/_site/unsubscribed`.
- Staff functions (`requireSupabaseAuth` + has_role check): save template, send test, send campaign (batches via Resend `/emails/batch`, 100 per call, records campaign), export CSV.
- Shared renderer `src/lib/email/render-email.ts`: blocks → table-based inline-styled HTML; same function powers the live preview (iframe) and sending, so preview = sent email. Email colors derived from Bottega token values in one mapping file (email clients can't read CSS variables — documented deviation).
- Feature code in `src/features/home/club-admin/`, copy in `src/content/en/club.ts`; Vitest for renderer escaping, block validation, batching and unsubscribe token handling.
- Rich text editing kept minimal (contenteditable with bold/italic/link, sanitized to an allowlist) to avoid a new UI library.
