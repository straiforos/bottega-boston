import { processMedia } from '@/lib/media/process-media';
import { uploadBlob } from '@/lib/r2/upload-client';

/** Resize in the staff browser, upload the standard version, return a public R2 URL for emails. */
export async function uploadEmailPhoto(file: File, onProgress: (fraction: number) => void) {
  const media = await processMedia(file, onProgress);
  const version = media.versions.find((v) => v.key === 'standard') ?? media.versions[0];
  const ext = version.blob.type === 'image/webp' ? 'webp' : 'jpg';
  const key = `gallery-media/email/${Date.now()}.${ext}`;
  return uploadBlob(key, version.blob);
}
