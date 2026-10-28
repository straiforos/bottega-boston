import { AwsClient } from 'aws4fetch';
import { env } from 'cloudflare:workers';

function s3() {
  const accessKeyId = env.S3_ACCESS_KEY_ID;
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY;
  const endpoint = env.S3_ENDPOINT?.replace(/\/+$/, '');
  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('R2 S3 credentials are not configured');
  }
  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: 's3' }),
    endpoint,
  };
}

export function publicMediaUrl(key: string) {
  const base = (env.R2_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (!base) {
    // Same-origin path served by the Worker from the MEDIA binding.
    return `/media/${key.replace(/^\/+/, '')}`;
  }
  return `${base}/${key.replace(/^\/+/, '')}`;
}

/** Signs a time-limited PUT so the browser can upload straight to R2. */
export async function createPresignedPut(key: string, contentType: string, expiresSeconds = 600) {
  const { client, endpoint } = s3();
  const url = new URL(`${endpoint}/${key}`);
  url.searchParams.set('X-Amz-Expires', String(expiresSeconds));
  const signed = await client.sign(
    new Request(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
    }),
    { aws: { signQuery: true } },
  );
  return {
    uploadUrl: signed.url,
    publicUrl: publicMediaUrl(key),
    key,
    headers: { 'Content-Type': contentType },
  };
}
