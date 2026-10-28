#!/usr/bin/env node
/**
 * Prepares apex + www hostnames for Workers custom domains without flapping DNS.
 *
 * For each hostname: if the Worker already owns it, leave DNS alone.
 * Otherwise delete blocking A / AAAA / CNAME (API 100117) so OpenTofu can attach.
 *
 * Env: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID,
 *      ZONE_NAME (default bottega.boston), WORKER_NAME (default bottega-boston),
 *      HOSTNAMES (comma-separated; default ZONE_NAME,www.ZONE_NAME)
 */
const accountToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const zoneName = (process.env.ZONE_NAME ?? 'bottega.boston').trim();
const workerName = (process.env.WORKER_NAME ?? 'bottega-boston').trim();
const hostnames = (process.env.HOSTNAMES ?? `${zoneName},www.${zoneName}`)
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

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
const attachedList = Array.isArray(domains) ? domains : [];

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
const zone = zones[0];
if (!zone) {
  console.error(`Zone ${zoneName} not found`);
  process.exit(1);
}

for (const hostname of hostnames) {
  const attached = attachedList.find(
    (d) => d.hostname === hostname && (!d.service || d.service === workerName),
  );

  if (attached) {
    console.log(
      `Workers custom domain already attached: ${hostname} → ${attached.service ?? workerName} (${attached.id}); leaving DNS alone`,
    );
    continue;
  }

  console.log(`No Workers custom domain for ${hostname}; clearing blocking records if any`);

  const records = await cf(
    `/zones/${zone.id}/dns_records?name=${encodeURIComponent(hostname)}&per_page=100`,
  );
  const blocking = records.filter((r) => ['A', 'AAAA', 'CNAME'].includes(r.type));

  if (blocking.length === 0) {
    console.log(`No blocking A/AAAA/CNAME records on ${hostname}`);
    continue;
  }

  for (const record of blocking) {
    console.log(`Deleting ${record.type} ${record.name} → ${record.content} (${record.id})`);
    await cf(`/zones/${zone.id}/dns_records/${record.id}`, { method: 'DELETE' });
  }

  console.log(`Cleared ${blocking.length} record(s) so Workers can own ${hostname}`);
}
