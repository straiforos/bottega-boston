# Editable gallery (inline, staff-only)

Let staff manage the home-page gallery the same way they manage the menu today: sign in with Google from the footer, then edit gallery tiles right on the home page. Visitors see the same gallery as now.

## What staff can do

- **Edit a tile** in place: caption, alt text, and replace the photo or video.
- **Add a photo or video** — new tiles append at the end.
- **Delete a tile** with the red Confirmation box (same as dish delete).
- **Reorder** with small up/down arrows on each tile (simple and reliable, no drag-and-drop).
- Staff pick the original photo or video (up to 500 MB); it's processed in the background in their browser before upload, with a progress bar ("Preparing video… 42%"). The page stays usable while it works.

## Background processing with free open-source tools (WebAssembly)

FFmpeg (video) runs as WebAssembly inside a background worker in the staff member's browser — free, open source, no extra server or service. Photo processing moves into the same kind of background worker so the page never freezes. Visitors never download these tools; they load only when staff open an editor.

```text
Staff picks file -> background worker
  -> photos: auto-orient, strip location data, 480 / 1600 / 4096 px WebP
  -> videos: 480p / 720p / 1080p web MP4 (fast start, no sound) + cover image
  -> all versions uploaded -> tile goes live for visitors
```

Visitors' browsers then pick the right version: slow connections and data-saver get the smallest, phones get standard, fast desktops get high quality, with automatic fallback to the next if one fails. Video shows its cover instantly and downloads nothing until the tile is near the screen. The existing gallery video gets its versions generated once during the build so it benefits too.

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
- `src/lib/media/media.worker.ts` (Vite `?worker` module Web Worker): video via `@ffmpeg/ffmpeg` + `@ffmpeg/core` (single-threaded core, so no cross-origin-isolation headers needed), lazily imported only from staff editors. H.264 MP4 `-movflags +faststart`, `-an`, 480p ~600 kbps / 720p ~1.5 Mbps / 1080p ~4 Mbps (never upscaled), poster JPEG. Photos via `createImageBitmap` + `OffscreenCanvas` in the same worker. Progress messages drive the editor's bar. Stored as `variants` jsonb + `poster_url`.
- Pure `videoSourcesForConnection` (effectiveType/saveData/screen width) orders `<source>` elements; `GalleryVideo` gains `poster`, `preload="none"` until IntersectionObserver says near-viewport, then `metadata`. Tested like `variantsForConnection`.
- Bucket cap 500 MB (project-wide limit raised to match).

## Verification

- Unit tests for the mapper and draft validation, alongside the existing menu tests; `bun run quality` passes.
- Playwright: visitors see the same 4 tiles with no controls; a signed-in admin session shows the ribbon, Edit/Delete/reorder controls, and the add tile form (media upload itself needs a real staff sign-in to try).

## Notes

- Processing uses the staff member's device: a 1-minute clip takes roughly 1–3 minutes on a laptop, longer on phones. Keep the tab open until it finishes; a laptop is recommended for videos.
- Video processing for slow connections ships as part of this work, not as a later step.
- The two existing intentional style deviations stay (red delete button, caption text size); no new ones planned.
