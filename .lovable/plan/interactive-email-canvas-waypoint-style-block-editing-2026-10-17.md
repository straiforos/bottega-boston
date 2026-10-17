# Interactive email canvas (Waypoint-style block editing)

## What staff get
- **Click-to-edit preview:** the email preview becomes the canvas. Hovering a block shows a terracotta outline; clicking selects it (solid outline + label chip like "Photo").
- **Floating block toolbar** on the selected block: move up, move down, duplicate, delete (delete asks for confirmation).
- **Insert between blocks:** hovering the gap between blocks shows a "+" pill; clicking opens a small block picker (headline, text, photo, columns, button, marquee, divider, spacer) and inserts the block right there.
- **Side inspector:** the left panel shows only the selected block's fields (instead of the long list of every block). Edits update the canvas live. With nothing selected it shows the email settings (subject, preview text).
- **Keyboard:** arrow up/down moves selection, Delete removes (with confirmation), Escape deselects. Desktop/phone preview toggle still works.
- Applies to templates (welcome, newsletter starter, catering) and newsletters alike.

## What stays the same
- Saved emails, sending, scheduling, analytics and the inbox output are unchanged — what you see is still exactly what is sent.
- Guests never load the editor.

## Technical details
- Canvas renders the same Waypoint HTML from `render-email.ts` into the existing iframe, with an editor-only flag that adds `data-block-id` wrappers. Wrappers are stripped for sends; a test asserts send output contains no editor attributes.
- Iframe ↔ parent via `postMessage` (origin checked): hover/select/insert events out, selection highlight in. Outline/"+"/toolbar overlays are drawn in the parent, positioned from block rects reported by the iframe (so overlays use Bottega `Button`, `PillLabel`, `Confirmation` and tokens; iframe stays pure email HTML).
- New pure helpers in `src/lib/email/blocks.ts`: `insertBlockAt`, `duplicateBlock`, `removeBlock`, `selectNeighbor` (tests for each).
- `src/features/emails/canvas/`: `EmailCanvas.tsx`, `CanvasOverlay.tsx`, `BlockPicker.tsx`, `useCanvasSelection.ts`; `BlockEditor` reused as the inspector body. `EmailEditorPage` swaps the block list for inspector + canvas. Styles in `emails.css` with tokens only.
- Accessibility: overlays are real buttons with labels; selection is announced via a live region; reduced motion disables outline transitions.
- Update `src/lib/email/AGENTS.md` with the editor-attribute stripping rule.
