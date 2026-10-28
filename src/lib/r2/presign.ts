import { AwsClient } from 'aws4fetch';
import { env } from 'cloudflare:workers';

/** Must match wrangler.jsonc r2_buckets.bucket_name / OpenTofu r2_bucket_name. */
const R2_BUCKET = 'bottega-media';

function s3() {
  const accessKeyId = env.S3_ACCESS_KEY_ID;
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY;
  // Account endpoint only — never include the bucket (path-style puts it in the URL).
  const endpoint = env.S3_ENDPOINT?.replace(/\/+$/, '').replace(/\/bottega-media$/i, '');
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
  const objectKey = key.replace(/^\/+/, '');
  const url = new URL(`${endpoint}/${R2_BUCKET}/${objectKey}`);
  url.searchParams.set('X-Amz-Expires', String(expiresSeconds));
  const signed = await client.sign(
    new Request(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
    }),
    // allHeaders: Content-Type must be in the signature or the browser PUT 403s.
    { aws: { signQuery: true, allHeaders: true } },
  );
  return {
    uploadUrl: signed.url,
    publicUrl: publicMediaUrl(objectKey),
    key: objectKey,
    headers: { 'Content-Type': contentType },
  };
}
