# Pasta Club email system with the Waypoint builder (Phases 1-4)

## What staff get
- **One Emails workspace** (the existing email builder link in the header) with tabs: Newsletters, Templates, Subscribers, Analytics.
- **Drag-and-build editor** with Waypoint-style blocks (headline, text, photo, button, columns, divider, spacer, marquee strip) and a live preview showing desktop and phone sizes. Everything is styled like Bottega and built with Bottega's own buttons, fields, upload box and dialogs.
- **Templates:** Welcome (sent automatically on signup), Newsletter starter, and Catering confirmation (prepared for later). Staff can duplicate and edit them.
- **Newsletters:** save drafts, send a test to yourself, send now to all subscribers (with a confirmation), or schedule a send.
- **Subscribers:** search, see status (active, unsubscribed, bounced), remove someone, download CSV.
- **Analytics** for each newsletter: delivered, opened, clicked, bounced, complained and unsubscribed counts, plus the most clicked links.

## What guests get
- The same Pasta Club signup and welcome email, now using the customized template.
- One-click unsubscribe stays in every email, plus a simple "email preferences" page.

## Phases
1. **Builder:** add the Waypoint email engine, Bottega block presets and theme, editor screens using Bottega components. Existing emails are converted automatically to the new format.
2. **Sending:** templates, drafts, test sends, scheduled sends, batches of 100 through Resend; welcome email reads the saved template.
3. **Analytics:** Resend reports each delivery, open, click, bounce and complaint back to the site; bounced or complaining addresses are marked automatically.
4. **Template registry and catering hook:** a single "send template X to Y" helper with fill-in fields (like guest name, order date), ready for a future catering form.

## Setup needed from you
- A verified sending domain in Resend (e.g. eatbottega.com) — required to email real guests.
- Turn on open and click tracking for that domain in Resend.
- Add a webhook in Resend pointing at the site, then paste its signing secret when I ask.

## Technical details
- Package: `@usewaypoint/email-builder` only (document schema + `renderToStaticMarkup`). The Waypoint sample editor app uses MUI, which conflicts with the design-system rule, so the editor UI is rebuilt with Bottega components; no MUI.
- `src/lib/email/waypoint/`: Bottega theme mapping (literal token copies in `email-theme.ts`), block presets, converter from current `blocks` jsonb to Waypoint `TReaderDocument`, render helper used by preview and send (preview = inbox rule kept). Custom marquee block rendered via Html block.
- Migration: `email_templates` gains `kind` (welcome/newsletter/catering), `document jsonb`, `variables text[]`; `email_campaigns` gains `status` (draft/scheduled/sending/sent), `scheduled_for`, `document`; new `email_sends` (campaign_id, subscriber_id, resend_id, status) and `email_events` (resend_id, type, url, occurred_at, raw, unique on svix id for dedupe). `club_subscribers.status`. Admin-only RLS via has_role, GRANTs per table; rollup view for campaign stats.
- Webhook: `src/routes/api/public/resend-webhook.ts`, Svix signature verification with `RESEND_WEBHOOK_SECRET`, zod validation, admin client loaded inside handler.
- Scheduling: pg_cron hitting `/api/public/send-scheduled` (cron-auth verified) every 5 min.
- `sendTemplate({ key, to, variables })` server helper with `{{variable}}` substitution (escaped); catering kind seeded but not triggered.
- Routes under `src/routes/_site/emails.*` (thin), features in `src/features/emails/`, copy in `src/content/en/club.ts`. Vitest: converter, variable substitution/escaping, webhook signature check, event-to-status mapping, batching.
- Update AGENTS.md email rule to reflect the Waypoint document format.
