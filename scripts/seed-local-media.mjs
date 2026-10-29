#!/usr/bin/env node
/**
 * Downloads every /media key referenced by the repo into export/local-media,
 * then puts each object into Miniflare R2 so vite preview can serve MEDIA.
 *
 * Sources (in order): MEDIA_ORIGIN (default https://bottega.boston)/media/<key>,
 * then Lovable CDN for keys that appear in src/assets/*.asset.json.
 *
 * Usage: node scripts/seed-local-media.mjs [--force]
 */
import { mkdir, writeFile, readdir, readFile, access, constants } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');
const mediaOrigin = (process.env.MEDIA_ORIGIN ?? 'https://bottega.boston').replace(/\/+$/, '');
const lovableHost = (process.env.LOVABLE_SITE_ORIGIN ?? 'https://bottega-delights-site.lovable.app').replace(
  /\/+$/,
  '',
);
const outRoot = path.join(root, 'export/local-media');
const bucket = 'bottega-media';

function contentType(file) {
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

function wrangler(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('bunx', ['wrangler', ...args], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d;
    });
    child.stderr.on('data', (d) => {
      stderr += d;
    });
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`wrangler failed (${code}): ${stderr || stdout}`));
    });
  });
}

async function exists(file) {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function collectKeys() {
  /** @type {Map<string, { required: boolean, lovable?: string, contentType?: string }>} */
  const keys = new Map();

  const assetsDir = path.join(root, 'src/assets');
  for (const file of (await readdir(assetsDir)).filter((f) => f.endsWith('.asset.json'))) {
    const meta = JSON.parse(await readFile(path.join(assetsDir, file), 'utf8'));
    const key = meta.r2_key;
    if (!key || typeof key !== 'string') continue;
    const lovable =
      meta.asset_id && meta.original_filename
        ? `${lovableHost}/__l5e/assets-v1/${meta.asset_id}/${encodeURIComponent(meta.original_filename)}`
        : undefined;
    keys.set(key, {
      required: true,
      lovable,
      contentType: typeof meta.content_type === 'string' ? meta.content_type : undefined,
    });
  }

  const sqlDir = path.join(root, 'drizzle/d1');
  for (const file of (await readdir(sqlDir)).filter((f) => f.endsWith('.sql'))) {
    const sql = await readFile(path.join(sqlDir, file), 'utf8');
    for (const match of sql.matchAll(/\/media\/([^\s'"\\]+)/g)) {
      const key = match[1];
      if (!keys.has(key)) keys.set(key, { required: false });
    }
  }

  return keys;
}

async function download(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BottegaLocalMediaSeed/1.0)',
      Accept: '*/*',
      ...headers,
    },
  });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

const keys = await collectKeys();
console.log(`Seeding ${keys.size} media key(s) → ${outRoot} and local R2 ${bucket}`);

let ok = 0;
let fail = 0;
const requiredFailed = [];

for (const [key, meta] of keys) {
  const dest = path.join(outRoot, key);
  process.stdout.write(`→ ${key}… `);

  try {
    if (!force && (await exists(dest))) {
      process.stdout.write('cached ');
    } else {
      let buf = await download(`${mediaOrigin}/media/${key}`);
      if (!buf && meta.lovable) {
        buf = await download(meta.lovable, { Referer: `${lovableHost}/` });
        if (buf) process.stdout.write('lovable ');
      }
      if (!buf) {
        console.log('FAIL download');
        fail += 1;
        if (meta.required) requiredFailed.push(key);
        continue;
      }
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      process.stdout.write(`ok ${buf.length} `);
    }

    const type = meta.contentType ?? contentType(dest);
    await wrangler([
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${dest}`,
      `--content-type=${type}`,
      '--local',
    ]);
    console.log('r2');
    ok += 1;
  } catch (err) {
    console.log(`FAIL ${err instanceof Error ? err.message : String(err)}`);
    fail += 1;
    if (meta.required) requiredFailed.push(key);
  }
}

console.log(`\n${ok} ok, ${fail} failed`);
if (requiredFailed.length) {
  console.error(`Required asset keys failed:\n${requiredFailed.map((k) => `  - ${k}`).join('\n')}`);
  process.exit(1);
}
