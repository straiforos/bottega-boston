# Editable gallery (inline, staff-only)

Let staff manage the home-page gallery the same way they manage the menu today: sign in with Google from the footer, then edit gallery tiles right on the home page. Visitors see the same gallery as now.

## What staff can do

- **Edit a tile** in place: caption, alt text, and replace the photo or video.
- **Add a photo or video** — new tiles append at the end.
- **Delete a tile** with the red Confirmation box (same as dish delete).
- **Reorder** with small up/down arrows on each tile (simple and reliable, no drag-and-drop).
- Staff upload the original photo or video (up to 500 MB); processing happens on a server, not on the staff member's device. The tile shows "Processing…" to staff and stays hidden from visitors until it's ready.

## Server processing with free open-source tools

The site's own server can't run heavy media tools (sharp for photos, FFmpeg for video) — it only handles quick requests. So processing runs on a small separate **media processor**: a free, open-source container (sharp + FFmpeg) that watches for new uploads, processes them, and saves the results back. It can run free on a home computer, a spare server, or a free-tier host (e.g. Fly.io / Render).

```text
Staff uploads original -> saved as "processing" -> media processor picks it up
  -> photos: auto-orient, strip location data, 480 / 1600 / 4096 px WebP
  -> videos: 480p / 720p / 1080p web MP4 (fast start, no sound) + cover image
  -> results saved -> tile goes live for visitors
```

Visitors' browsers then pick the right version: slow connections and data-saver get the smallest, phones get standard, fast desktops get high quality, with automatic fallback to the next if one fails. Video shows its cover instantly and downloads nothing until the tile is near the screen. The existing gallery video and dish photos move to the same pipeline (dish photos stop being processed in the browser).

**What you'll need to do:** start the media processor once somewhere (I'll include the container and a one-page setup guide). Until it's running, new uploads stay in "Processing…".

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
- Media processor in `media-processor/` (Dockerfile, Node + sharp + FFmpeg): polls a `media_jobs` table (status pending/processing/done/failed, source path, target row) using the service key supplied as its own env var; originals land in a private `media-originals` bucket. Video: H.264 MP4 `+faststart`, no audio, 480p ~600 kbps / 720p ~1.5 Mbps / 1080p ~4 Mbps (never upscaled), poster JPEG. Writes `variants` jsonb + `poster_url` + `status` on the gallery/menu row. RLS: visitors read only `status = 'ready'` rows; staff see all.
- Pure `videoSourcesForConnection` (effectiveType/saveData/screen width) orders `<source>` elements; `GalleryVideo` gains `poster`, `preload="none"` until IntersectionObserver says near-viewport, then `metadata`. Tested like `variantsForConnection`.
- Browser photo processing (`process-image.ts`) is retired in favor of the processor; the size check stays client-side.

## Verification

- Unit tests for the mapper and draft validation, alongside the existing menu tests; `bun run quality` passes.
- Playwright: visitors see the same 4 tiles with no controls; a signed-in admin session shows the ribbon, Edit/Delete/reorder controls, and the add tile form (media upload itself needs a real staff sign-in to try).

## Notes

- The media processor is the one piece that runs outside this site; it's free software but needs somewhere to run. I can build and test everything else, but uploads won't finish processing until it's started.
- Also add "Process gallery videos for slow connections" to the roadmap when building.
- The two existing intentional style deviations stay (red delete button, caption text size); no new ones planned.
