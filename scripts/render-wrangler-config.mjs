#!/usr/bin/env node
/**
 * Writes wrangler.ci.json from wrangler.jsonc + OpenTofu D1 id.
 * Keeps account-specific UUIDs out of git.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'wrangler.jsonc');
const outPath = join(root, 'wrangler.ci.json');

const databaseId = process.env.D1_DATABASE_ID?.trim();
if (!databaseId) {
  console.error('D1_DATABASE_ID is required');
  process.exit(1);
}

const raw = readFileSync(sourcePath, 'utf8');
const withoutComments = raw.replace(/^\s*\/\/.*$/gm, '');
const config = JSON.parse(withoutComments);

const d1 = config.d1_databases?.[0];
if (!d1) {
  console.error('wrangler.jsonc is missing d1_databases[0]');
  process.exit(1);
}
d1.database_id = databaseId;
delete d1.$comment;

writeFileSync(outPath, `${JSON.stringify(config, null, 2)}\n`);
console.log(`Wrote ${outPath} with database_id=${databaseId}`);
