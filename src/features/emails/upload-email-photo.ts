import { supabase } from '@/integrations/supabase/client';
import { GALLERY_BUCKET } from '@/lib/gallery/gallery-api';
import { processMedia } from '@/lib/media/process-media';

const TEN_YEARS_SECONDS = 60 * 60 * 24 * 365 * 10;

/** Resize in the staff browser, upload the standard version, return a long-lived URL for emails. */
export async function uploadEmailPhoto(file: File, onProgress: (fraction: number) => void) {
  const media = await processMedia(file, onProgress);
  const version = media.versions.find((v) => v.key === 'standard') ?? media.versions[0];
  const ext = version.blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `email/${Date.now()}.${ext}`;
  const upload = await supabase.storage
    .from(GALLERY_BUCKET)
    .upload(path, version.blob, { contentType: version.blob.type, cacheControl: '31536000' });
  if (upload.error) throw upload.error;
  const signed = await supabase.storage.from(GALLERY_BUCKET).createSignedUrl(path, TEN_YEARS_SECONDS);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}
