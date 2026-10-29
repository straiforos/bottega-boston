#!/usr/bin/env node
/**
 * Clears corrupted Miniflare metadata (e.g. mismatched _cf_ALARM schema)
 * without wiping D1 content rows or R2 object bodies.
 */
import { readdir, unlink, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const stateRoot = path.join(root, '.wrangler/state');

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const files = await walk(stateRoot);
let removed = 0;
for (const file of files) {
  const base = path.basename(file);
  if (base === 'metadata.sqlite' || base.startsWith('metadata.sqlite-')) {
    await unlink(file);
    console.log(`removed ${path.relative(root, file)}`);
    removed += 1;
  }
}

const cacheDir = path.join(stateRoot, 'v3/cache');
try {
  await rm(cacheDir, { recursive: true, force: true });
  console.log(`removed ${path.relative(root, cacheDir)}`);
} catch {
  /* absent */
}

console.log(removed ? `Cleared ${removed} metadata file(s).` : 'No metadata files found.');
console.log('D1 content and R2 object stores were left in place.');
