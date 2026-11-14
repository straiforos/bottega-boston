---
name: gemini-image-edit
description: >-
  Regenerate or polish Bottega photos with Gemini image edit (gemini-nano-banana-2.1),
  not Cursor GenerateImage. Use for menu dining/catering studio polish, hero/lifestyle
  composition edits, Pasta Club cutouts, gallery stills, or any “regenerate / fix /
  remove prop / match this table / reshoot” request on project media.
---

# Gemini image edit (Bottega)

## Hard rules

1. **Use Gemini**, never Cursor `GenerateImage`, for Bottega media when `GEMINI_API_KEY` is available.
2. **Model**: `gemini-nano-banana-2.1` (successor to deprecated `gemini-3.1-flash-image`).
3. **Write only under `tmp/`** (e.g. `tmp/hero-regen/`, `tmp/dish-48-regen/`). Do **not** overwrite `export/local-media/`, `src/assets/*.asset.json`, or CDN keys until the user asks to promote.
4. After every generation, **Read the output image** and check the user's constraints before reporting done.
5. Iterate with new passes; keep prior drafts as separate filenames.

## Run the CLI

```bash
set -a && source .env && set +a
bun scripts/gemini-edit-image.ts \
  --out tmp/<job>/out.jpg \
  --aspect <ratio> \
  --prompt "..." \
  <image1> [image2...]
```

- Long prompts: `--prompt-file tmp/<job>/prompt.txt`
- Defaults: `--size 2K`, `--model gemini-nano-banana-2.1`
- Aspect tips: menu studio `1:1`; original hero ~`3:2`; wide hero `16:9`; cutouts often `4:3`

Do not `echo` or log `GEMINI_API_KEY`.

## Prompt pattern

Label every attached image by role:

- `Image 1 is …` (identity / source to keep)
- `Image 2 is …` (layout, materials, room, or plate reference only)
- Put non-negotiables in **CRITICAL** lines (no wine glass, exact bench, layer count, etc.)
- Prefer “edit / rebuild / keep identity” over “draw a new person”

### Modes

**Lifestyle / hero** — keep subject identity; swap setting materials from a real photo; match original framing tightness when asked; omit props the user forbids.

**Menu dining polish** — keep dish identity; apply `diningStudioSceneLines` from `src/lib/menu/studio-scene.ts` (warm stone `#C4B5A0`, white coupe plate when plated, square crop, no cutout paste). Batch jobs: `bun scripts/import-chownow-photos.ts` / `polish-remaining-from-chownow.ts`.

**Catering polish** — same stone; hotel pan/tray; `cateringStudioSceneLines`. Batch: `bun scripts/polish-catering-from-dining.ts`.

**Cutout** — transparent PNG, soft edges, no fringe; see `scripts/regenerate-pasta-club.ts`.

## Review checklist

- [ ] Constraints satisfied (props, seating, text/neon, crop tightness)
- [ ] Reference materials match the **real** photo (e.g. smooth cognac bench ≠ tufted booth)
- [ ] Live asset untouched unless user said to promote

## Promote (only when asked)

Copy reviewed file into the existing `export/local-media/...` path (or staff upload flow), update size/`?v=` on the asset JSON if needed, and leave a short note of what changed.
