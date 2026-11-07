#!/usr/bin/env bun
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHOWNOW_REMAINING_MAP } from '../src/lib/menu/chownow-remaining-map';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const photoDir = path.join(root, 'tmp/chownow-photos');
const ORDER_PAGE = 'https://order.chownow.com/order/18964/locations/27186';

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

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const html = await (
  await fetch(ORDER_PAGE, { headers: { 'User-Agent': 'bottega-photo-import/1.0' } })
).text();
const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(
  (m) => m[1],
);
const items: Array<{ name: string; imageUrl: string }> = [];
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
      ? ((menu as { hasMenuSection?: unknown[] }).hasMenuSection ?? [])
      : [];
  for (const section of sections) {
    if (!section || typeof section !== 'object') continue;
    for (const item of (section as { hasMenuItem?: unknown[] }).hasMenuItem ?? []) {
      if (!item || typeof item !== 'object') continue;
      const name = (item as { name?: string }).name;
      let image = (item as { image?: string | string[] }).image;
      if (Array.isArray(image)) image = image[0];
      const imageUrl = extractOtterUrl(image);
      if (name && imageUrl) items.push({ name, imageUrl });
    }
  }
}

await mkdir(photoDir, { recursive: true });
const names = [...new Set(Object.values(CHOWNOW_REMAINING_MAP).map((s) => s.chowNowName))];
for (const name of names) {
  const key = name.replace(/[^\w.-]+/g, '_');
  const dest = path.join(photoDir, `remaining-source-${key}.jpg`);
  if (await exists(dest)) {
    console.log(`have ${name}`);
    continue;
  }
  const urls = [...new Set(items.filter((i) => i.name === name).map((i) => i.imageUrl))];
  if (!urls.length) {
    console.error(`MISSING ${name}`);
    continue;
  }
  if (urls.length > 1) {
    console.error(`CONFLICT ${name}`);
    continue;
  }
  const res = await fetch(urls[0]);
  if (!res.ok) {
    console.error(`FAIL ${name} ${res.status}`);
    continue;
  }
  await writeFile(dest, new Uint8Array(await res.arrayBuffer()));
  console.log(`saved ${name}`);
}
