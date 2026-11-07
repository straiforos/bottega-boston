#!/usr/bin/env bun
/** Copies polished catering JPGs into export/local-media and updates local D1. */
import { access, copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Database } from 'bun:sqlite';
import { CHOWNOW_CATERING_REUSE_MAP } from '../src/lib/menu/chownow-catering-reuse-map';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const photoDir = path.join(root, 'tmp/chownow-photos');
const localMediaRoot = path.join(root, 'export/local-media');
const d1Dir = path.join(root, '.wrangler/state/v3/d1/miniflare-D1DatabaseObject');

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const updates: Array<{ dishId: string; mediaUrl: string }> = [];
for (const dishId of Object.keys(CHOWNOW_CATERING_REUSE_MAP)) {
  const src = path.join(photoDir, `${dishId}.jpg`);
  if (!(await exists(src))) continue;
  const key = `menu-images/${dishId}/studio.jpg`;
  const dest = path.join(localMediaRoot, key);
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(src, dest);
  updates.push({ dishId, mediaUrl: `/media/${key}` });
}

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

console.log(`Synced ${updates.length}/${Object.keys(CHOWNOW_CATERING_REUSE_MAP).length} catering dishes to local media + D1`);
