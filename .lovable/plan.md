# Editable gallery (inline, staff-only)

Let staff manage the home-page gallery the same way they manage the menu today: sign in with Google from the footer, then edit gallery tiles right on the home page. Visitors see the same gallery as now.

## What staff can do

- **Edit a tile** in place: caption, alt text, and replace the photo or video.
- **Add a photo or video** — new tiles append at the end.
- **Delete a tile** with the red Confirmation box (same as dish delete).
- **Reorder** with small up/down arrows on each tile (simple and reliable, no drag-and-drop).
- Photos go through the same browser processing as dish photos (auto-orient, location strip, small/standard/high-quality versions); videos upload as-is up to 200 MB.

Signed-in staff also see a small red "Editing the gallery" ribbon above the gallery, mirroring the "Editing the menu" ribbon on the menu page.

## Data & storage

- New `gallery_items` table: id, media type (image/video), media URL, image variants (jsonb), alt, caption, sort order, updated at. Public read for everyone, admin-only writes (same `has_role` gate as menu tables), with GRANTs in the same migration. Seeded with the four current gallery items (3 photos + 1 video) so the page never empties.
- New private `gallery-media` storage bucket (200 MB cap; project-wide limit raised to match). Signed 10-year URLs stored in the table, same pattern as menu images.
- Home page reads the gallery live with the bundled current assets as the SSR/placeholder fallback — same approach as the menu fallback.

## Code changes

- Extract the shared photo pipeline to `src/lib/media/process-image.ts` (menu imports move to it); add a video validator alongside (type + size check, no processing).
- New `src/lib/gallery/` (`types.ts`, `gallery-api.ts`): pure `buildGalleryItems` mapper, `galleryQueryOptions`, upload/save/add/delete/move helpers — mirroring `menu-api.ts`.
- New admin pieces under `src/features/home/admin/`: `EditableTile`, `TileEditor`, `AddTile`, `useGalleryAdmin` — mirroring the menu admin components, reusing `FileUpload`, `Confirmation`, `TextField`, `Button`.
- `SocialSection` renders from live data and swaps in the editable tiles when signed in; `GalleryVideo` and the tile hairline/zoom styling stay untouched.
- Staff copy (labels, confirm-delete wording, errors) in `src/content/en/staff.ts`; admin styles in `home.css` using design-system tokens only.
- Footer sign-in returns to the page you were on (currently it always lands on the menu page).

## Verification

- Unit tests for the mapper and draft validation, alongside the existing menu tests; `bun run quality` passes.
- Playwright: visitors see the same 4 tiles with no controls; a signed-in admin session shows the ribbon, Edit/Delete/reorder controls, and the add tile form (media upload itself needs a real staff sign-in to try).

## Notes

- Videos aren't resized in the browser — a practical 200 MB upload limit instead.
- The two existing intentional style deviations stay (red delete button, caption text size); no new ones planned.
