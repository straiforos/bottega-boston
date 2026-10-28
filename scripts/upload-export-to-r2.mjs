#!/usr/bin/env node
/**
 * Uploads a local export tree into R2 bottega-media, preserving relative keys.
 *
 * ENV:
 *   EXPORT_ROOT  relative dir under the repo (default: export/supabase-storage)
 *   R2_BUCKET    (default: bottega-media)
 *   CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
 */
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportRoot = path.resolve(root, process.env.EXPORT_ROOT ?? 'export/supabase-storage');
const bucket = process.env.R2_BUCKET ?? 'bottega-media';

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
if (!token || !accountId) {
  console.error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required');
  process.exit(1);
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

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
      env: {
        ...process.env,
        CLOUDFLARE_API_TOKEN: token,
        CLOUDFLARE_ACCOUNT_ID: accountId,
      },
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

const files = await walk(exportRoot);
if (files.length === 0) {
  console.error(`No files under ${exportRoot}; run export-supabase-storage.mjs first`);
  process.exit(1);
}

console.log(`Uploading ${files.length} file(s) to R2 ${bucket}`);
for (const file of files) {
  const key = path.relative(exportRoot, file).split(path.sep).join('/');
  const type = contentType(file);
  const size = (await stat(file)).size;
  process.stdout.write(`→ ${key} (${size} bytes)… `);
  await wrangler([
    'r2',
    'object',
    'put',
    `${bucket}/${key}`,
    `--file=${file}`,
    `--content-type=${type}`,
    '--remote',
  ]);
  console.log('ok');
}
console.log('Done');
