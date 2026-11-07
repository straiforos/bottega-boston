#!/usr/bin/env bun
/**
 * Generates catering tray variants by feeding already-polished dining photos
 * into Gemini, then publishes them to local export/local-media + D1.
 *
 * Usage: bun scripts/polish-catering-from-dining.ts
 *        bun scripts/polish-catering-from-dining.ts --skip-publish
 *        bun scripts/polish-catering-from-dining.ts --force --only=dish-71,dish-72
 */
import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Database } from 'bun:sqlite';
import { menuSections } from '../src/lib/menu-data';
import {
  CHOWNOW_CATERING_REUSE_MAP,
  cateringPresentationHint,
  type CateringPresentation,
} from '../src/lib/menu/chownow-catering-reuse-map';
import { cateringStudioSceneLines } from '../src/lib/menu/studio-scene';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const photoDir = path.join(root, 'tmp/chownow-photos');
const localMediaRoot = path.join(root, 'export/local-media');
const skipPublish = process.argv.includes('--skip-publish');
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

function polishCateringPrompt(
  dishName: string,
  description: string,
  presentation: CateringPresentation,
  adaptHint?: string,
): string {
  const detail = description.trim() ? ` Menu description: ${description.trim()}` : '';
  const adapt = adaptHint?.trim() ? ` ${adaptHint.trim()}` : '';
  return [
    `Adapt this single-serving studio food photo into a LARGE QUANTITY catering tray shot of "${dishName}".${detail}${adapt}`,
    cateringPresentationHint(presentation),
    'Fill the tray generously so the quantity looks abundant for a group order (roughly a dozen or more portions where that fits the food).',
    'Keep the same dish identity, ingredients, sauces, and colors so it still looks like what this kitchen serves. Do not invent a different recipe. Do not keep the original single-portion plate.',
    ...cateringStudioSceneLines(),
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
      content?: {
        parts?: Array<{
          inlineData?: { data?: string };
          inline_data?: { data?: string };
        }>;
      };
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

function publishLocal(dishId: string, polishedPath: string) {
  const key = `menu-images/${dishId}/studio.jpg`;
  const mediaUrl = `/media/${key}`;
  const dest = path.join(localMediaRoot, key);
  return { key, mediaUrl, dest, polishedPath };
}

async function updateLocalD1(updates: Array<{ dishId: string; mediaUrl: string }>) {
  const d1Dir = path.join(root, '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(d1Dir)).filter(
    (f) => f.endsWith('.sqlite') && !f.startsWith('metadata'),
  );
  if (!files.length) throw new Error('No local D1 content database found under .wrangler/state');
  for (const file of files) {
    const db = new Database(path.join(d1Dir, file));
    const update = db.prepare(
      'UPDATE menu_items SET image_url = $url, image_variants = NULL WHERE id = $id',
    );
    db.transaction(() => {
      for (const row of updates) {
        update.run({ $url: row.mediaUrl, $id: row.dishId });
      }
    })();
    db.close();
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Set GEMINI_API_KEY in .env (or the environment) before running this script');
  }

  await mkdir(photoDir, { recursive: true });
  const entries = Object.entries(CHOWNOW_CATERING_REUSE_MAP).filter(
    ([id]) => !onlyIds || onlyIds.has(id),
  );
  if (onlyIds) {
    for (const id of onlyIds) {
      if (!(id in CHOWNOW_CATERING_REUSE_MAP)) throw new Error(`Unknown catering id for --only: ${id}`);
    }
  }
  console.log(
    `Polishing ${entries.length} catering dishes from dining studio photos${force ? ' (force)' : ''}`,
  );

  let polishedCount = 0;
  let failedCount = 0;
  const ready: string[] = [];

  for (const [cateringId, spec] of entries) {
    const site = dishCopy.get(cateringId);
    if (!site) throw new Error(`Missing catering dish ${cateringId}`);
    const rawSourcePath = path.join(photoDir, `${spec.sourceDishId}-source.jpg`);
    const polishedSourcePath = path.join(photoDir, `${spec.sourceDishId}.jpg`);
    const sourcePath =
      spec.useRawSource && (await exists(rawSourcePath)) ? rawSourcePath : polishedSourcePath;
    const polishedPath = path.join(photoDir, `${cateringId}.jpg`);

    if (!(await exists(sourcePath))) {
      console.error(
        `missing ${spec.useRawSource ? 'raw' : 'polished'} source ${path.basename(sourcePath)} for ${cateringId}`,
      );
      failedCount += 1;
      continue;
    }

    if (!force && (await exists(polishedPath))) {
      console.log(`skip polish ${cateringId} (already exists)`);
      polishedCount += 1;
      ready.push(cateringId);
      continue;
    }

    try {
      const sourceImages: Uint8Array[] = [await readFile(sourcePath)];
      // For shape-critical bites, also pass the polished dining shot as a second reference.
      if (
        spec.useRawSource &&
        sourcePath === rawSourcePath &&
        (await exists(polishedSourcePath))
      ) {
        sourceImages.push(await readFile(polishedSourcePath));
      }
      console.log(
        `source ${cateringId}: ${sourceImages.map((_, i) => (i === 0 ? path.basename(sourcePath) : path.basename(polishedSourcePath))).join(' + ')}`,
      );
      const polished = await editWithGemini(
        apiKey,
        sourceImages,
        polishCateringPrompt(site.name, site.description, spec.presentation, spec.adaptHint),
      );
      await writeFile(polishedPath, polished);
      polishedCount += 1;
      ready.push(cateringId);
      console.log(`polished ${cateringId} (${site.name}) ← ${spec.sourceDishId}`);
    } catch (error) {
      failedCount += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`polish failed ${cateringId}: ${message}`);
      if (/quota|rate.?limit|billing|free tier|prepayment/i.test(message)) {
        console.error('Gemini quota blocked; re-run later. Existing polished files will be skipped.');
        break;
      }
    }
  }

  if (!skipPublish && ready.length) {
    const updates: Array<{ dishId: string; mediaUrl: string }> = [];
    for (const dishId of ready) {
      const polishedPath = path.join(photoDir, `${dishId}.jpg`);
      const { mediaUrl, dest } = publishLocal(dishId, polishedPath);
      await mkdir(path.dirname(dest), { recursive: true });
      await copyFile(polishedPath, dest);
      updates.push({ dishId, mediaUrl });
      console.log(`published ${dishId} → ${mediaUrl}`);
    }
    await updateLocalD1(updates);
    console.log(`Updated local D1 for ${updates.length} catering dishes (filesystem /media; no wrangler).`);
  }

  console.log(`Done. polished=${polishedCount} failed_or_stopped=${failedCount}`);
  if (failedCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
