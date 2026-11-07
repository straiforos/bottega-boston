#!/usr/bin/env bun
/**
 * Downloads matched ChowNow dish photos and writes Gemini-polished copies under
 * tmp/chownow-photos/. Reads GEMINI_API_KEY from the environment (Bun loads .env).
 *
 * Usage: bun scripts/import-chownow-photos.ts
 *        bun scripts/import-chownow-photos.ts --force --only=dish-5
 */
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { menuSections } from '../src/lib/menu-data';
import {
  CHOWNOW_PHOTO_MAP,
  assertMapMatchesDiningMenu,
  resolveChowNowPhotos,
  type ChowNowMenuItem,
} from '../src/lib/menu/chownow-photo-map';
import { diningStudioSceneLines } from '../src/lib/menu/studio-scene';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'tmp/chownow-photos');
const CHOWNOW_LOCATION = 27186;
/** Successor to gemini-3.1-flash-image (deprecated / shutting down). */
const GEMINI_MODEL = 'gemini-nano-banana-2.1';
const ORDER_PAGE = `https://order.chownow.com/order/18964/locations/${CHOWNOW_LOCATION}`;
const MENU_API = `https://api.chownow.com/api/restaurant/${CHOWNOW_LOCATION}/menu`;

const dishCopy = new Map(
  menuSections.flatMap((section) =>
    section.items.map((item) => [
      item.id,
      { name: item.name, description: item.description, sectionName: section.name },
    ]),
  ),
);

function extractOtterUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('http') && !raw.includes('image-resizing')) return raw;
  const match = /image=([^&]+)/.exec(raw);
  if (!match) return raw.startsWith('http') ? raw : null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

async function fetchMenuFromApi(): Promise<ChowNowMenuItem[]> {
  const response = await fetch(MENU_API, {
    headers: { Accept: 'application/json', 'User-Agent': 'bottega-photo-import/1.0' },
  });
  if (!response.ok) throw new Error(`ChowNow menu API ${response.status}`);
  const data = (await response.json()) as {
    menu_categories?: Array<{ items?: Array<{ name?: string; image?: { file_key?: string; cropped_url?: string } }> }>;
  };
  const items: ChowNowMenuItem[] = [];
  for (const category of data.menu_categories ?? []) {
    for (const item of category.items ?? []) {
      const imageUrl = extractOtterUrl(item.image?.file_key) ?? extractOtterUrl(item.image?.cropped_url);
      if (item.name && imageUrl) items.push({ name: item.name, imageUrl });
    }
  }
  return items;
}

async function fetchMenuFromOrderPage(): Promise<ChowNowMenuItem[]> {
  const response = await fetch(ORDER_PAGE, {
    headers: { Accept: 'text/html', 'User-Agent': 'bottega-photo-import/1.0' },
  });
  if (!response.ok) throw new Error(`ChowNow order page ${response.status}`);
  const html = await response.text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(
    (m) => m[1],
  );
  for (const block of blocks) {
    let data: unknown;
    try {
      data = JSON.parse(block);
    } catch {
      continue;
    }
    if (!data || typeof data !== 'object' || !('hasMenu' in data)) continue;
    const menus = (data as { hasMenu?: unknown }).hasMenu;
    const menu = Array.isArray(menus) ? menus[0] : menus;
    const sections =
      menu && typeof menu === 'object' && 'hasMenuSection' in menu
        ? ((menu as { hasMenuSection?: unknown }).hasMenuSection as unknown[])
        : [];
    const items: ChowNowMenuItem[] = [];
    for (const section of sections ?? []) {
      if (!section || typeof section !== 'object') continue;
      const sectionItems = (section as { hasMenuItem?: unknown }).hasMenuItem;
      if (!Array.isArray(sectionItems)) continue;
      for (const item of sectionItems) {
        if (!item || typeof item !== 'object') continue;
        const name = (item as { name?: string }).name;
        let image = (item as { image?: string | string[] }).image;
        if (Array.isArray(image)) image = image[0];
        const imageUrl = extractOtterUrl(image);
        if (name && imageUrl) items.push({ name, imageUrl });
      }
    }
    if (items.length) return items;
  }
  throw new Error('No JSON-LD menu with photos found on the ChowNow order page');
}

async function loadChowNowItems(): Promise<ChowNowMenuItem[]> {
  const fromApi = await fetchMenuFromApi();
  if (fromApi.length) {
    console.log(`Loaded ${fromApi.length} photographed items from ChowNow API`);
    return fromApi;
  }
  console.log('ChowNow menu API empty (likely closed); falling back to order page JSON-LD');
  const fromPage = await fetchMenuFromOrderPage();
  console.log(`Loaded ${fromPage.length} photographed items from order page`);
  return fromPage;
}

/** Polished Limoncello slice — composition reference for other plated cakes. */
const CAKE_LAYOUT_REF_DISH = 'dish-50';

function polishPrompt(dishName: string, description: string): string {
  const detail = description.trim()
    ? ` Menu description: ${description.trim()}`
    : '';
  const coffee =
    /latte|cappuccino|macchiato|espresso|americano|caff|coffee|tea/i.test(dishName)
      ? ' For coffee drinks: plain milk foam or crema only—no latte art, hearts, leaves, rosettes, or poured designs. This cafe does not do latte art.'
      : '';
  const isCake = /cake/i.test(`${dishName} ${description}`);
  const requirePlate = /cake|tiramisu|pudding|cookie|cannol|nuvole|dolci|dessert/i.test(
    `${dishName} ${description}`,
  );
  const cakeSlice = isCake
    ? ' For cake: show ONE single triangular dining slice on the plate—never the whole cake, never a cake with a missing wedge, never a slice leaning against the rest. Keep the exact sponge layer count and fillings visible in the source cut face—do not invent extra layers.'
    : '';
  return [
    `Polish this restaurant food photo of "${dishName}" into a clean studio product shot.${detail}${coffee}${cakeSlice}`,
    'Keep the same dish identity, ingredients, portion size, and sauce colors so it still looks like what the kitchen serves.',
    ...diningStudioSceneLines({ requirePlate }),
  ].join(' ');
}

/** Second pass: keep polished cake identity, match Limoncello slice/camera only. */
function cakeLayoutAlignPrompt(): string {
  return [
    'Image 1 is the finished cake studio shot. Image 2 is layout-only (Limoncello cake)—use image 2 ONLY as the composition template.',
    'Rebuild so camera height, crop, plate position, plate size, lighting direction, and cake-slice silhouette/placement on the plate match image 2 exactly (same tip direction, same lean, same scale in the plate).',
    'Keep image 1 food identity exactly: same frosting, crumb, and sponge layer count—do not add or remove layers.',
    'Do not copy image 2 flavor, sponge color, frosting color, garnish, or layer count.',
    ...diningStudioSceneLines({ requirePlate: true }),
  ].join(' ');
}

async function editWithGemini(
  apiKey: string,
  sourceImages: readonly Uint8Array[],
  prompt: string,
): Promise<Uint8Array> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              ...sourceImages.map((bytes) => ({
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: Buffer.from(bytes).toString('base64'),
                },
              })),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio: '1:1' },
        },
      }),
    },
  );
  const payload = (await response.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string }; inline_data?: { data?: string } }> };
    }>;
  };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini HTTP ${response.status}`);
  }
  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const data = part.inlineData?.data ?? part.inline_data?.data;
    if (data) return Buffer.from(data, 'base64');
  }
  throw new Error('Gemini response had no image');
}

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Set GEMINI_API_KEY in .env (or the environment) before running this script');
  }

  assertMapMatchesDiningMenu(
    CHOWNOW_PHOTO_MAP,
    [...dishCopy.entries()].map(([id, d]) => ({ id, name: d.name, sectionName: d.sectionName })),
  );

  const force = process.argv.includes('--force');
  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const onlyIds = onlyArg
    ? new Set(
        onlyArg
          .slice('--only='.length)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      )
    : null;

  const items = await loadChowNowItems();
  let resolved = resolveChowNowPhotos(CHOWNOW_PHOTO_MAP, items);
  if (onlyIds) {
    for (const id of onlyIds) {
      if (!(id in CHOWNOW_PHOTO_MAP)) throw new Error(`Unknown dining dish for --only: ${id}`);
    }
    resolved = resolved.filter((row) => onlyIds.has(row.dishId));
  }
  await mkdir(outDir, { recursive: true });

  console.log(`Writing ${resolved.length} dishes to ${outDir}${force ? ' (force)' : ''}`);

  for (const row of resolved) {
    const sourcePath = path.join(outDir, `${row.dishId}-source.jpg`);
    if (await exists(sourcePath)) {
      console.log(`reuse source ${row.dishId}`);
      continue;
    }
    const imageResponse = await fetch(row.imageUrl);
    if (!imageResponse.ok) throw new Error(`Download failed for ${row.dishId}: ${imageResponse.status}`);
    await writeFile(sourcePath, new Uint8Array(await imageResponse.arrayBuffer()));
    console.log(`saved source ${row.dishId} ← ${row.chowNowName}`);
  }

  let polishedCount = 0;
  let failedCount = 0;
  for (const row of resolved) {
    const site = dishCopy.get(row.dishId);
    if (!site) throw new Error(`Missing site dish ${row.dishId}`);
    const sourcePath = path.join(outDir, `${row.dishId}-source.jpg`);
    const polishedPath = path.join(outDir, `${row.dishId}.jpg`);

    if (!force && (await exists(polishedPath))) {
      console.log(`skip polish ${row.dishId} (already exists)`);
      polishedCount += 1;
      continue;
    }

    try {
      let polished = await editWithGemini(
        apiKey,
        [await readFile(sourcePath)],
        polishPrompt(site.name, site.description),
      );
      const isCake = /cake/i.test(`${site.name} ${site.description}`);
      const layoutRefPath = path.join(outDir, `${CAKE_LAYOUT_REF_DISH}.jpg`);
      const useCakeLayout =
        isCake && row.dishId !== CAKE_LAYOUT_REF_DISH && (await exists(layoutRefPath));
      if (useCakeLayout) {
        console.log(`layout align ${row.dishId} ← ${CAKE_LAYOUT_REF_DISH}`);
        polished = await editWithGemini(
          apiKey,
          [polished, await readFile(layoutRefPath)],
          cakeLayoutAlignPrompt(),
        );
      }
      await writeFile(polishedPath, polished);
      polishedCount += 1;
      console.log(`polished ${row.dishId} (${site.name})`);
    } catch (error) {
      failedCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`polish failed ${row.dishId}: ${message}`);
      if (/quota|rate.?limit|billing|free tier/i.test(message)) {
        console.error(
          'Gemini image quota blocked. Enable billing on this API key at https://ai.dev/rate-limit then re-run; existing *-source.jpg files will be reused.',
        );
        break;
      }
    }
  }

  console.log(`Done. sources=${resolved.length} polished=${polishedCount} failed_or_stopped=${failedCount}`);
  if (failedCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
