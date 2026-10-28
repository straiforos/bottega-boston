#!/usr/bin/env node
/**
 * Deletes apex A / AAAA / CNAME records that block Workers custom domains
 * (Cloudflare API 100117). Leaves other record types alone.
 *
 * Prefer scripts/ensure-workers-apex.mjs in CI: it no-ops when the Workers
 * custom domain is already attached, so deploys do not flap the apex.
 */
const accountToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
const zoneName = (process.env.ZONE_NAME ?? 'bottega.boston').trim();

if (!accountToken) {
  console.error('CLOUDFLARE_API_TOKEN is required');
  process.exit(1);
}

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accountToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!body.success) {
    const msg = (body.errors ?? []).map((e) => e.message).join('; ') || res.statusText;
    throw new Error(`${path}: ${msg}`);
  }
  return body.result;
}

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
const zone = zones[0];
if (!zone) {
  console.error(`Zone ${zoneName} not found`);
  process.exit(1);
}

const records = await cf(
  `/zones/${zone.id}/dns_records?name=${encodeURIComponent(zoneName)}&per_page=100`,
);
const blocking = records.filter((r) => ['A', 'AAAA', 'CNAME'].includes(r.type));

if (blocking.length === 0) {
  console.log(`No blocking A/AAAA/CNAME records on ${zoneName}`);
  process.exit(0);
}

for (const record of blocking) {
  console.log(`Deleting ${record.type} ${record.name} → ${record.content} (${record.id})`);
  await cf(`/zones/${zone.id}/dns_records/${record.id}`, { method: 'DELETE' });
}

console.log(`Cleared ${blocking.length} record(s) so Workers can own ${zoneName}`);
