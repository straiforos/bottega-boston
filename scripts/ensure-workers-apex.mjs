#!/usr/bin/env node
/**
 * Prepares the apex hostname for a Workers custom domain without flapping DNS.
 *
 * If the Worker already owns ZONE_NAME, exit without touching records.
 * Otherwise delete blocking apex A / AAAA / CNAME (API 100117) so OpenTofu
 * can attach the custom domain.
 *
 * Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID,
 *      ZONE_NAME (default bottega.boston), WORKER_NAME (default bottega-boston)
 */
const accountToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const zoneName = (process.env.ZONE_NAME ?? 'bottega.boston').trim();
const workerName = (process.env.WORKER_NAME ?? 'bottega-boston').trim();

if (!accountToken || !accountId) {
  console.error('CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required');
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

const domains = await cf(`/accounts/${accountId}/workers/domains`);
const attached = (Array.isArray(domains) ? domains : []).find(
  (d) => d.hostname === zoneName && (!d.service || d.service === workerName),
);

if (attached) {
  console.log(
    `Workers custom domain already attached: ${zoneName} → ${attached.service ?? workerName} (${attached.id}); leaving DNS alone`,
  );
  process.exit(0);
}

console.log(`No Workers custom domain for ${zoneName}; clearing blocking apex records if any`);

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
