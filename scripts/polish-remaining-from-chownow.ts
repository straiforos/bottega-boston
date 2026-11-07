#!/usr/bin/env bun
/**
 * Downloads ChowNow sources for remaining dishes (pasta trays, sides, etc.),
 * polishes with Gemini, and publishes to local export/local-media + D1.
 *
 * Usage: bun scripts/polish-remaining-from-chownow.ts
 *        bun scripts/polish-remaining-from-chownow.ts --force --only=dish-67
 */
import { access, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Database } from 'bun:sqlite';
import { menuSections } from '../src/lib/menu-data';
import {
  CHOWNOW_REMAINING_MAP,
  remainingPresentationHint,
  type RemainingPresentation,
} from '../src/lib/menu/chownow-remaining-map';
import type { ChowNowMenuItem } from '../src/lib/menu/chownow-photo-map';
import { cateringStudioSceneLines, diningStudioSceneLines } from '../src/lib/menu/studio-scene';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const photoDir = path.join(root, 'tmp/chownow-photos');
const localMediaRoot = path.join(root, 'export/local-media');
const d1Dir = path.join(root, '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
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
const CHOWNOW_LOCATION = 27186;
const ORDER_PAGE = `https://order.chownow.com/order/18964/locations/${CHOWNOW_LOCATION}`;
const MENU_API = `https://api.chownow.com/api/restaurant/${CHOWNOW_LOCATION}/menu`;
const GEMINI_MODEL = 'gemini-3.1-flash-image';

const dishCopy = new Map(
  menuSections.flatMap((section) =>
    section.items.map((item) => [
      item.id,
      { name: item.name, description: item.description, sectionName: section.name },
    ]),
  ),
);

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

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

async function loadChowNowItems(): Promise<ChowNowMenuItem[]> {
  const api = await fetch(MENU_API, {
    headers: { Accept: 'application/json', 'User-Agent': 'bottega-photo-import/1.0' },
  });
  const data = (await api.json()) as {
    menu_categories?: Array<{
      items?: Array<{ name?: string; image?: { file_key?: string; cropped_url?: string } }>;
    }>;
  };
  const fromApi: ChowNowMenuItem[] = [];
  for (const category of data.menu_categories ?? []) {
    for (const item of category.items ?? []) {
      const imageUrl =
        extractOtterUrl(item.image?.file_key) ?? extractOtterUrl(item.image?.cropped_url);
      if (item.name && imageUrl) fromApi.push({ name: item.name, imageUrl });
    }
  }
  if (fromApi.length) {
    console.log(`Loaded ${fromApi.length} photographed items from ChowNow API`);
    return fromApi;
  }

  console.log('ChowNow menu API empty (likely closed); falling back to order page JSON-LD');
  const html = await (
    await fetch(ORDER_PAGE, { headers: { Accept: 'text/html', 'User-Agent': 'bottega-photo-import/1.0' } })
  ).text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(
    (m) => m[1],
  );
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block);
    } catch {
      continue;
    }
    if (!parsed || typeof parsed !== 'object' || !('hasMenu' in parsed)) continue;
    const menus = (parsed as { hasMenu?: unknown }).hasMenu;
    const menu = Array.isArray(menus) ? menus[0] : menus;
    const sections =
      menu && typeof menu === 'object' && 'hasMenuSection' in menu
        ? ((menu as { hasMenuSection?: unknown[] }).hasMenuSection ?? [])
        : [];
    const items: ChowNowMenuItem[] = [];
    for (const section of sections) {
      if (!section || typeof section !== 'object') continue;
      const sectionItems = (section as { hasMenuItem?: unknown[] }).hasMenuItem;
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
    if (items.length) {
      console.log(`Loaded ${items.length} photographed items from order page`);
      return items;
    }
  }
  throw new Error('No ChowNow photos found');
}

function resolveUrl(chowNowName: string, items: readonly ChowNowMenuItem[]): string {
  const urls = [...new Set(items.filter((i) => i.name === chowNowName).map((i) => i.imageUrl))];
  if (!urls.length) throw new Error(`ChowNow item not found or has no photo: ${JSON.stringify(chowNowName)}`);
  if (urls.length > 1) {
    throw new Error(`ChowNow item ${JSON.stringify(chowNowName)} has conflicting photo URLs`);
  }
  return urls[0];
}

function polishPrompt(
  dishName: string,
  description: string,
  presentation: RemainingPresentation,
  adaptHint: string | undefined,
): string {
  const detail = description.trim() ? ` Menu description: ${description.trim()}` : '';
  const adapt = adaptHint ? ` ${adaptHint}` : '';
  const isCatering =
    presentation === 'pasta-tray' ||
    presentation === 'topping-tray' ||
    presentation === 'focaccia-tray' ||
    presentation === 'coffee-catering';
  const bulk = isCatering
    ? 'This must read as LARGE QUANTITY catering—full hotel pan, packed tray, or bulk beverage service—never a single plate or cup.'
    : 'Keep a clean single-portion (or small retail) product presentation unless the adapt note says otherwise.';
  return [
    `Polish this restaurant food photo into a studio shot of "${dishName}".${detail}${adapt}`,
    remainingPresentationHint(presentation),
    bulk,
    'Keep the food identity plausible for this kitchen: correct sauce colors, proteins, and pasta shape when specified.',
    ...(isCatering ? cateringStudioSceneLines() : diningStudioSceneLines({ requirePlate: true })),
  ].join(' ');
}

async function editWithGemini(apiKey: string, sourceBytes: Uint8Array, prompt: string): Promise<Uint8Array> {
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
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: Buffer.from(sourceBytes).toString('base64'),
                },
              },
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
      content?: { parts?: Array<{ inlineData?: { data?: string }; inline_data?: { data?: string } }> };
    }>;
  };
  if (!response.ok) throw new Error(payload.error?.message ?? `Gemini HTTP ${response.status}`);
  for (const part of payload.candidates?.[0]?.content?.parts ?? []) {
    const data = part.inlineData?.data ?? part.inline_data?.data;
    if (data) return Buffer.from(data, 'base64');
  }
  throw new Error('Gemini response had no image');
}

async function updateLocalD1(updates: Array<{ dishId: string; mediaUrl: string }>) {
  const files = (await readdir(d1Dir)).filter((f) => f.endsWith('.sqlite') && !f.startsWith('metadata'));
  if (!files.length) throw new Error('No local D1 content database found');
  for (const file of files) {
    const db = new Database(path.join(d1Dir, file));
    const stmt = db.prepare('UPDATE menu_items SET image_url = $url, image_variants = NULL WHERE id = $id');
    db.transaction(() => {
      for (const row of updates) stmt.run({ $url: row.mediaUrl, $id: row.dishId });
    })();
    db.close();
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('Set GEMINI_API_KEY in .env before running this script');

  await mkdir(photoDir, { recursive: true });
  const items = await loadChowNowItems();
  const entries = Object.entries(CHOWNOW_REMAINING_MAP).filter(([id]) => !onlyIds || onlyIds.has(id));
  if (onlyIds) {
    for (const id of onlyIds) {
      if (!(id in CHOWNOW_REMAINING_MAP)) throw new Error(`Unknown remaining id for --only: ${id}`);
    }
  }
  console.log(`Polishing ${entries.length} remaining dishes${force ? ' (force)' : ''}`);

  let polishedCount = 0;
  let failedCount = 0;
  const ready: string[] = [];

  // Cache downloads by ChowNow name so Mini Pasta / Penne are fetched once.
  const sourceByName = new Map<string, string>();

  for (const [dishId, spec] of entries) {
    const site = dishCopy.get(dishId);
    if (!site) throw new Error(`Missing site dish ${dishId}`);
    const sourceKey = spec.chowNowName.replace(/[^\w.-]+/g, '_');
    const sharedSourcePath = path.join(photoDir, `remaining-source-${sourceKey}.jpg`);
    const polishedPath = path.join(photoDir, `${dishId}.jpg`);

    if (!(await exists(sharedSourcePath))) {
      if (!sourceByName.has(spec.chowNowName)) {
        const url = resolveUrl(spec.chowNowName, items);
        sourceByName.set(spec.chowNowName, url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download failed for ${spec.chowNowName}: ${res.status}`);
        await writeFile(sharedSourcePath, new Uint8Array(await res.arrayBuffer()));
        console.log(`saved source ← ${spec.chowNowName}`);
      }
    }

    if (!force && (await exists(polishedPath))) {
      console.log(`skip polish ${dishId} (already exists)`);
      polishedCount += 1;
      ready.push(dishId);
      continue;
    }

    try {
      const sourceBytes = await readFile(sharedSourcePath);
      const polished = await editWithGemini(
        apiKey,
        sourceBytes,
        polishPrompt(site.name, site.description, spec.presentation, spec.adaptHint),
      );
      await writeFile(polishedPath, polished);
      polishedCount += 1;
      ready.push(dishId);
      console.log(`polished ${dishId} (${site.name}) ← ${spec.chowNowName}`);
    } catch (error) {
      failedCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`polish failed ${dishId}: ${message}`);
      if (/quota|rate.?limit|billing|free tier/i.test(message)) {
        console.error('Gemini quota blocked; re-run later.');
        break;
      }
    }
  }

  if (ready.length) {
    const updates: Array<{ dishId: string; mediaUrl: string }> = [];
    for (const dishId of ready) {
      const polishedPath = path.join(photoDir, `${dishId}.jpg`);
      const key = `menu-images/${dishId}/studio.jpg`;
      const dest = path.join(localMediaRoot, key);
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(polishedPath, dest);
      updates.push({ dishId, mediaUrl: `/media/${key}` });
      console.log(`published ${dishId} → /media/${key}`);
    }
    await updateLocalD1(updates);
    console.log(`Updated local D1 for ${updates.length} dishes`);
  }

  console.log(`Done. polished=${polishedCount} failed_or_stopped=${failedCount}`);
  if (failedCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
