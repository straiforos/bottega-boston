import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';

const requestSchema = z.object({
  key: z.string().min(1).max(500).regex(/^[a-zA-Z0-9/_.:-]+$/),
  contentType: z.string().min(1).max(120),
});

/** Staff-only: returns a presigned R2 PUT URL and the public URL to store on the row. */
export const createUploadUrl = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    const { createPresignedPut } = await import('./presign');
    return createPresignedPut(data.key, data.contentType);
  });

/** Browser helper: process locally, then PUT to the signed URL. */
export async function uploadBlob(key: string, blob: Blob): Promise<string> {
  const signed = await createUploadUrl({
    data: { key, contentType: blob.type || 'application/octet-stream' },
  });
  const response = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: signed.headers,
    body: blob,
  });
  if (!response.ok) throw new Error(`Upload failed (${response.status})`);
  return signed.publicUrl;
}
