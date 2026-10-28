#!/usr/bin/env node
/**
 * Injects the OpenTofu D1 id into Wrangler configs.
 *
 * Modes (WRANGLER_CONFIG_MODE):
 * - ci (default): write wrangler.ci.json from wrangler.jsonc (secrets / D1 migrate)
 * - dist: patch dist/server/wrangler.json from the Vite Cloudflare build (deploy)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mode = (process.env.WRANGLER_CONFIG_MODE ?? 'ci').trim();

const databaseId = process.env.D1_DATABASE_ID?.trim();
if (!databaseId) {
  console.error('D1_DATABASE_ID is required');
  process.exit(1);
}

function setDatabaseId(config, label) {
  const d1 = config.d1_databases?.[0];
  if (!d1) {
    console.error(`${label} is missing d1_databases[0]`);
    process.exit(1);
  }
  d1.database_id = databaseId;
  delete d1.$comment;
}

if (mode === 'dist') {
  const outPath = join(root, 'dist/server/wrangler.json');
  if (!existsSync(outPath)) {
    console.error(`Missing ${outPath}; run bun run build first`);
    process.exit(1);
  }
  const config = JSON.parse(readFileSync(outPath, 'utf8'));
  setDatabaseId(config, outPath);
  // Vite Cloudflare plugin copies diagnostic fields Wrangler 4 rejects as config.
  for (const key of [
    'legacy_env',
    'configPath',
    'userConfigPath',
    'topLevelName',
    'definedEnvironments',
  ]) {
    delete config[key];
  }
  writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Patched ${outPath} with database_id=${databaseId}`);
  process.exit(0);
}

const sourcePath = join(root, 'wrangler.jsonc');
const outPath = join(root, 'wrangler.ci.json');
const raw = readFileSync(sourcePath, 'utf8');
const withoutComments = raw.replace(/^\s*\/\/.*$/gm, '');
const config = JSON.parse(withoutComments);
setDatabaseId(config, sourcePath);
writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote ${outPath} with database_id=${databaseId}`);
