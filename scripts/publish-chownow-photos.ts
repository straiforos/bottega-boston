#!/usr/bin/env bun
/**
 * Publishes polished dish photos from tmp/chownow-photos into local (or remote)
 * R2 + D1. Local is the default.
 *
 * Uploads every tmp/chownow-photos/dish-<n>.jpg (not *-source or *-vN variants).
 *
 * Usage:
 *   bun scripts/publish-chownow-photos.ts
 *   bun scripts/publish-chownow-photos.ts --remote --config wrangler.ci.json
 */
import { access, copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const photoDir = path.join(root, 'tmp/chownow-photos');
const localMediaRoot = path.join(root, 'export/local-media');
const bucket = 'bottega-media';
const remote = process.argv.includes('--remote');
const locationFlag = remote ? '--remote' : '--local';

const configFlagIndex = process.argv.indexOf('--config');
const configPath =
  configFlagIndex >= 0 ? process.argv[configFlagIndex + 1] : undefined;
if (configFlagIndex >= 0 && !configPath) {
  console.error('Missing path after --config');
  process.exit(1);
}

function wrangler(args: string[]) {
  const withConfig = configPath ? [...args, '--config', configPath] : args;
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn('bunx', ['wrangler', ...withConfig], {
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

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function dishIdFromFile(name: string): string | null {
  const match = /^dish-(\d+)\.jpg$/.exec(name);
  return match ? `dish-${match[1]}` : null;
}

async function main() {
  const dishIds = (await readdir(photoDir))
    .map(dishIdFromFile)
    .filter((id): id is string => Boolean(id))
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));

  if (!dishIds.length) {
    console.error(`No dish-*.jpg files under ${photoDir}`);
    process.exit(1);
  }

  console.log(
    `Publishing ${dishIds.length} dish photo(s) to ${remote ? 'remote' : 'local'} R2 + D1` +
      (configPath ? ` (config ${configPath})` : ''),
  );

  for (const dishId of dishIds) {
    const file = path.join(photoDir, `${dishId}.jpg`);
    if (!(await exists(file))) continue;
    const key = `menu-images/${dishId}/studio.jpg`;
    const mediaUrl = `/media/${key}`;
    process.stdout.write(`→ ${dishId}… `);
    await wrangler([
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${file}`,
      '--content-type=image/jpeg',
      locationFlag,
    ]);
    // vite dev short-circuits /media from export/local-media before the Worker.
    if (!remote) {
      const localFile = path.join(localMediaRoot, key);
      await mkdir(path.dirname(localFile), { recursive: true });
      await copyFile(file, localFile);
    }
    await wrangler([
      'd1',
      'execute',
      'bottega',
      locationFlag,
      '--command',
      `UPDATE menu_items SET image_url = '${mediaUrl}', image_variants = NULL WHERE id = '${dishId}'`,
    ]);
    console.log(mediaUrl);
  }

  console.log('Done.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
