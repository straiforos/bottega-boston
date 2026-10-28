#!/usr/bin/env node
/**
 * Downloads Lovable CDN media referenced by src/assets/*.asset.json into
 * export/bundled-media/<r2_key>, ready for upload into R2 bottega-media.
 *
 * Source: https://bottega-delights-site.lovable.app/__l5e/assets-v1/<asset_id>/<filename>
 */
import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = (process.env.LOVABLE_SITE_ORIGIN ?? 'https://bottega-delights-site.lovable.app').replace(
  /\/+$/,
  '',
);
const outRoot = path.join(root, 'export/bundled-media');

const assetsDir = path.join(root, 'src/assets');
const files = (await readdir(assetsDir)).filter((f) => f.endsWith('.asset.json'));

let ok = 0;
let fail = 0;
for (const file of files) {
  const meta = JSON.parse(await readFile(path.join(assetsDir, file), 'utf8'));
  const { asset_id: assetId, original_filename: name, r2_key: key, content_type: contentType } = meta;
  if (!assetId || !name || !key) {
    console.error(`skip ${file}: missing fields`);
    fail += 1;
    continue;
  }
  const src = `${host}/__l5e/assets-v1/${assetId}/${encodeURIComponent(name)}`;
  const dest = path.join(outRoot, key);
  process.stdout.write(`→ ${key}… `);
  const res = await fetch(src, {
    headers: {
      Referer: `${host}/`,
      'User-Agent': 'Mozilla/5.0 (compatible; BottegaMediaExport/1.0)',
      Accept: '*/*',
    },
  });
  if (!res.ok) {
    console.log(`FAIL ${res.status}`);
    fail += 1;
    continue;
  }
  await mkdir(path.dirname(dest), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  console.log(`ok ${buf.length} ${contentType ?? ''}`);
  ok += 1;
}

console.log(`\n${ok} ok, ${fail} failed → ${outRoot}`);
if (fail) process.exit(1);
