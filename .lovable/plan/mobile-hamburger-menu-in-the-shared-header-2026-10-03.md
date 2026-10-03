# Mobile hamburger menu in the shared header

## Situation

The Bottega design system does not ship a hamburger menu component — its full component list is: ArchFrame, Button, Card, Checkbox, Display, LinkAction, Logo, Marquee, PillLabel, Radio, Serif, SiteHeader, Stamp, TextField, ThemeToggle, WaveRibbon. `SiteHeader` is only "logo left, links/CTA right".

Today on small screens the header's three nav links wrap onto a full-width second row under the logo, next to the Order Now button — which is crowded at 393px.

The vendor files under `src/design-system/` must never be edited, so the hamburger is built in app code, composed entirely from design-system components and `--bt-*` tokens.

## Plan

### 1. `src/components/BottegaHeader.tsx` — add hamburger toggle and panel (mobile only)

- Keep `SiteHeader` as the shell. Add, as part of its `action` content:
  - A toggle built from the design-system `Button` (variant matching the current header state: `primary` when cream, `cream` when scrolled forest), rendering a three-bar icon drawn with `currentColor` so it inherits the button's ink. `aria-expanded` + `aria-controls`, label "Open menu" / "Close menu".
  - A dropdown panel below the header when open: a `<nav>` using the same router-aware `createLink(LinkAction)` links as the desktop nav (Our story, Menu, Come hang out) plus the Order Now `Button`. Panel background follows the header state (cream vs forest via `bt-surface-light`/`bt-surface-dark` token classes), hard offset shadow `--bt-shadow-card`, links stacked with the display font and cream/forest tones matching the panel.
- Close the panel when a link is tapped, when the Escape key is pressed, and on scroll past the sticky threshold is not required (panel stays usable); keep it simple.
- Desktop keeps today's inline links — the toggle and panel are hidden above the mobile breakpoint.

### 2. `src/styles.css` — header/mobile menu styles

- Replace the mobile rule that wraps `.header-navigation` onto its own row with: hide the desktop nav + Order Now button on mobile, hide the toggle/panel on desktop (same breakpoint as the current mobile block).
- Panel styling with tokens only: width 100%, stacked links, gaps from `--bt-space-*`, hard shadow `--bt-shadow-card`, borders `--bt-border-thin`.
- Small open/close transition using `--bt-duration`, disabled under `prefers-reduced-motion`.
- Footer stays untouched.

### 3. Verify

- Playwright at 393px: toggle opens/closes the panel, panel shows the three links + Order Now, tapping a link navigates and closes the panel, scrolled state turns the toggle cream.
- Desktop check: header unchanged (links inline, no toggle).
- Build log clean.

## Technical notes

- New component logic lives only in `BottegaHeader.tsx` + `src/styles.css`; no design-system file is modified.
- All style values come from `--bt-*` tokens; the hamburger icon uses `currentColor` for ink.
- The menu page reuses `BottegaHeader`, so both pages get the hamburger automatically.
