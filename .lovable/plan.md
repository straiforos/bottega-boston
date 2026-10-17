# Events, catering requests and event-space requests

## What guests get

**Come hang out with us (home page)**
- Upcoming events show under the existing heading as Bottega cards: photo, title, date and time, location, short description.
- Each event can show a "Get tickets" button that opens that event's Ticket Tailor checkout, embedded on the page in a dialog. If Ticket Tailor doesn't load, the button links to the ticket page in a new tab instead.
- Past events hide on their own. With no upcoming events, only the heading and the two request buttons show.
- Two buttons under the events: "Request catering" and "Book our space".

**Catering request page (/catering)**
- A "See the catering menu" link opens the catering trays on the Menu page.
- Guests build their order from the catering items on the menu: pick a tray, set how many, repeat. The page shows a running list.
- They also fill in name, email, phone, pickup or delivery, date and time, delivery address if needed, dietary needs, and notes.
- When they send it, they see a thank-you note and get a confirmation email with their order. The restaurant gets an email too.

**Event space request page (/events/request)**
- Asks for name, email, phone, which location, date and time, number of guests, the type of event, and notes.
- Optional "Add catering" step that uses the same order picker as the catering form.
- Same thank-you note, confirmation email and restaurant email.

## What staff get (Site Admin menu)

```text
Site Admin
  Emails      (unchanged)
  Events      list, add, edit, delete, "Email Pasta Club"
  Requests    one inbox: catering + event space
```

- **Events**: add or edit an event (title, dates, location, photo, description, Ticket Tailor link, published or hidden). Deleting asks first, with a red button. "Email Pasta Club" opens a new newsletter already filled in with the event photo, details and ticket button, ready to edit and send.
- **Requests inbox**: filter by type and status (New, Quoted, Booked, Declined). Open a request to see all its details and order lines, change its status, add private staff notes, and reply by email.
- Staff can also edit events on the home page with the same floating buttons used elsewhere on the site.

## Choices to confirm while building
- Where restaurant notification emails go (default: ciao@eatbottega.com).
- Whether Ticket Tailor links are per event (planned) or one box office for all events.
- Guests reach the inbox emails only after a sending domain is verified in Resend. This was already on the to-do list.

## Technical details
- Tables (each gets grants and RLS in the same migration):
  - `events`: published rows readable by everyone; only admins can write (`has_role`).
  - `event_requests`: kind (catering or space), contact fields, date and time, guests, location, `order_lines` jsonb (menu item id, name, price snapshot, quantity), status, staff_notes. No public read. Inserts only through a server function that checks the input with zod, limits field lengths, checks order items against `menu_items` in the catering section, and rate-limits by email. Admins read and update.
- Emails use the existing Resend `sendTemplate` with new templates `catering-request-received`, `space-request-received` and `staff-request-alert`, plus the existing `catering-confirmation` group. These are one-off messages, not newsletters.
- "Email Pasta Club" builds a draft campaign from event blocks with `newBlock`, then sends staff to `/emails/compose?id=…`.
- Ticket Tailor: the URL must be https and on tickettailor.com. It is embedded with their iframe widget, loaded only after the guest clicks.
- Code locations: `src/features/events/` (EventsList, EventCard, EventEditorDialog, RequestsInbox), `src/features/requests/` (CateringForm, SpaceForm, OrderPicker), `src/lib/events/` (API, validation, tests), copy in `src/content/en/events.ts`, routes `_site/catering.tsx`, `_site/events_.request.tsx`, `_site/admin.events.tsx`, `_site/admin.requests.tsx` (staff-only, noindex). Header links are added to the Site Admin submenu, and the request buttons are added to EventsSection.
- Tests: upcoming/past filtering, order total and validation, Ticket Tailor URL check, request status changes.
- Add an `AGENTS.md` rule for the request-intake boundary (writes from the public form go only through the server function).
