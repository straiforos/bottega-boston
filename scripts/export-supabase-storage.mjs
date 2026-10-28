#!/usr/bin/env node
/**
 * Downloads private Lovable/Supabase storage buckets to ./export/supabase-storage.
 * Uses SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY from the environment (or .env).
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

async function loadEnv() {
  try {
    const text = await readFile(path.join(root, '.env'), 'utf8');
    for (const line of text.split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!m || process.env[m[1]]) continue;
      process.env[m[1]] = m[2].replace(/^"|"$/g, '');
    }
  } catch {
    // optional
  }
}

await loadEnv();

const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required');
  process.exit(1);
}

const authHeaders = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

async function list(bucket, prefix = '') {
  const res = await fetch(`${url}/storage/v1/object/list/${bucket}`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  });
  if (!res.ok) throw new Error(`list ${bucket}/${prefix}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function walk(bucket, prefix = '') {
  const entries = await list(bucket, prefix);
  const files = [];
  for (const entry of entries) {
    const full = prefix ? `${prefix}${entry.name}` : entry.name;
    if (entry.id == null && entry.metadata == null) {
      files.push(...(await walk(bucket, `${full}/`)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function download(bucket, objectPath, outRoot) {
  const res = await fetch(`${url}/storage/v1/object/${bucket}/${encodeURI(objectPath)}`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`download ${bucket}/${objectPath}: ${res.status} ${await res.text()}`);
  const dest = path.join(outRoot, bucket, objectPath);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`ok ${bucket}/${objectPath}`);
}

const outRoot = path.join(root, 'export/supabase-storage');
for (const bucket of ['menu-images', 'gallery-media']) {
  console.log(`\n=== ${bucket} ===`);
  const files = await walk(bucket);
  console.log(`found ${files.length} file(s)`);
  for (const f of files) await download(bucket, f, outRoot);
}
console.log(`\nDone → ${outRoot}`);
