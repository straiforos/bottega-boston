/** Object-key prefixes staff may request presigned PUTs for. */
export const ALLOWED_UPLOAD_PREFIXES = ['menu-images/', 'gallery-media/'] as const;

export function isAllowedUploadKey(key: string) {
  if (!key || key.includes('..') || key.startsWith('/')) return false;
  return ALLOWED_UPLOAD_PREFIXES.some((prefix) => key.startsWith(prefix));
}
