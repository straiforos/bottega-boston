# Editable gallery (inline, staff-only)

Let staff manage the home-page gallery the same way they manage the menu today: sign in with Google from the footer, then edit gallery tiles right on the home page. Visitors see the same gallery as now.

## What staff can do

- **Edit a tile** in place: caption, alt text, and replace the photo or video.
- **Add a photo or video** — new tiles append at the end.
- **Delete a tile** with the red Confirmation box (same as dish delete).
- **Reorder** with small up/down arrows on each tile (simple and reliable, no drag-and-drop).
- Photos go through the same browser processing as dish photos (auto-orient, location strip, small/standard/high-quality versions).
- Videos (up to 500 MB) go through a new video processing step in the staff member's browser before upload — see below.

## Video processing for slow connections and phones

When staff upload a video, the browser prepares it before saving ("Preparing video… 42%"):
- **Three versions:** small (480p, low bitrate), standard (720p) and high quality (1080p), all as web-friendly MP4 set up to start playing before fully downloaded. Sound is removed (gallery videos play muted).
- **A cover image** taken from the first frame, shown instantly while the video loads.
- **Visitors' browsers pick the right version:** slow connections and data-saver get the small one; phones get standard; fast desktops get high quality. If one version fails to load, the browser falls back to the next. Nothing downloads until the tile is near the screen, and only a small preview loads before someone hovers or taps play.
- The existing gallery video gets the same three versions + cover generated once, so it benefits too.

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
- Video pipeline `src/lib/media/process-video.ts`: ffmpeg.wasm loaded lazily only in the staff editor (never in the visitor bundle); H.264/AAC-free MP4 with `+faststart`, renditions 480p ~600 kbps / 720p ~1.5 Mbps / 1080p ~4 Mbps (never upscaled), poster JPEG. Stored as `video_variants` jsonb + `poster_url`. Pure `videoSourcesForConnection` (effectiveType/saveData/screen width) orders `<source>` elements; `GalleryVideo` gains `poster`, `preload="none"` until IntersectionObserver says near-viewport, then `metadata`. Tested like `variantsForConnection`.

## Verification

- Unit tests for the mapper and draft validation, alongside the existing menu tests; `bun run quality` passes.
- Playwright: visitors see the same 4 tiles with no controls; a signed-in admin session shows the ribbon, Edit/Delete/reorder controls, and the add tile form (media upload itself needs a real staff sign-in to try).

## Notes

- Video processing runs on the staff member's device and takes a while for long clips (roughly real-time or slower on phones); a laptop is recommended for uploads. Keep the tab open until it finishes.
- Also add "Process gallery videos for slow connections" to the roadmap when building.
- The two existing intentional style deviations stay (red delete button, caption text size); no new ones planned.
