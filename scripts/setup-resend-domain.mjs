#!/usr/bin/env node
/**
 * Registers ZONE_NAME with Resend (sending only) and upserts the DNS records
 * Resend returns into the Cloudflare zone (DNS-only, never proxied).
 *
 * Env: RESEND_API_KEY, CLOUDFLARE_API_TOKEN, ZONE_NAME (default bottega.boston)
 */
const resendKey = process.env.RESEND_API_KEY?.trim();
const cfToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
const zoneName = (process.env.ZONE_NAME ?? 'bottega.boston').trim();

if (!resendKey || !cfToken) {
  console.error('RESEND_API_KEY and CLOUDFLARE_API_TOKEN are required');
  process.exit(1);
}

async function resend(path, init = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Resend ${path}: ${res.status} ${text}`);
  }
  if (!res.ok) {
    const msg = body?.message || body?.error || text || res.statusText;
    throw new Error(`Resend ${path}: ${res.status} ${msg}`);
  }
  return body;
}

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfToken}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json();
  if (!body.success) {
    const msg = (body.errors ?? []).map((e) => e.message).join('; ') || res.statusText;
    throw new Error(`Cloudflare ${path}: ${msg}`);
  }
  return body.result;
}

function fqdn(name) {
  if (!name || name === zoneName) return zoneName;
  if (name.endsWith(`.${zoneName}`) || name === zoneName) return name;
  return `${name}.${zoneName}`;
}

const listed = await resend('/domains');
const domains = listed.data ?? listed;
let domain = (Array.isArray(domains) ? domains : []).find((d) => d.name === zoneName);

if (!domain) {
  console.log(`Creating Resend domain ${zoneName}…`);
  domain = await resend('/domains', {
    method: 'POST',
    body: JSON.stringify({
      name: zoneName,
      region: 'us-east-1',
      open_tracking: false,
      click_tracking: false,
      capabilities: { sending: 'enabled', receiving: 'disabled' },
    }),
  });
} else {
  console.log(`Resend domain ${zoneName} already exists (${domain.id}, ${domain.status})`);
  domain = await resend(`/domains/${domain.id}`);
}

const records = domain.records ?? [];
if (!records.length) {
  console.error('No DNS records returned from Resend');
  process.exit(1);
}

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
const zone = zones[0];
if (!zone) {
  console.error(`Cloudflare zone ${zoneName} not found`);
  process.exit(1);
}

for (const rec of records) {
  const name = fqdn(rec.name);
  const type = rec.type;
  const content = String(rec.value ?? '').replace(/^"|"$/g, '');
  const priority = rec.priority;

  const existing = await cf(
    `/zones/${zone.id}/dns_records?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}&per_page=100`,
  );
  const match = existing.find((r) => {
    if (type === 'MX') return r.content === content && r.priority === priority;
    return r.content === content || r.content === `"${content}"`;
  });
  if (match) {
    console.log(`ok ${type} ${name}`);
    continue;
  }

  const payload = {
    type,
    name,
    content,
    ttl: 1,
    proxied: false,
    ...(type === 'MX' && priority != null ? { priority } : {}),
  };

  if (existing[0]) {
    console.log(`update ${type} ${name}`);
    await cf(`/zones/${zone.id}/dns_records/${existing[0].id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } else {
    console.log(`create ${type} ${name}`);
    await cf(`/zones/${zone.id}/dns_records`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

console.log(`Requesting Resend verification for ${domain.id}…`);
try {
  await resend(`/domains/${domain.id}/verify`, { method: 'POST' });
} catch (err) {
  console.warn(String(err.message || err));
}

const refreshed = await resend(`/domains/${domain.id}`);
console.log(`status=${refreshed.status}`);
for (const rec of refreshed.records ?? []) {
  console.log(`  ${rec.type} ${fqdn(rec.name)} → ${rec.status}`);
}
console.log(`\nFrom address once verified: Bottega Pasta Club <club@${zoneName}>`);
