/** Pure helpers for gallery video renditions; shared by the processor and the player. */

export const MAX_MEDIA_UPLOAD_BYTES = 500 * 1024 * 1024;

export type VideoRenditionKey = 'small' | 'standard' | 'hq';

export interface VideoRenditionSpec {
  readonly key: VideoRenditionKey;
  /** Target length of the shorter edge, in pixels. */
  readonly shortEdge: number;
  readonly kbps: number;
}

export const VIDEO_RENDITIONS: readonly VideoRenditionSpec[] = [
  { key: 'small', shortEdge: 480, kbps: 600 },
  { key: 'standard', shortEdge: 720, kbps: 1500 },
  { key: 'hq', shortEdge: 1080, kbps: 4000 },
];

export function mediaSizeError(bytes: number): string | null {
  return bytes > MAX_MEDIA_UPLOAD_BYTES ? 'Photos and videos can be up to 500 MB.' : null;
}

/** Renditions worth making for a source: never upscale, but always keep the smallest one. */
export function renditionsFor(width: number, height: number): VideoRenditionSpec[] {
  const shortEdge = Math.min(width, height);
  const fitting = VIDEO_RENDITIONS.filter((spec) => spec.shortEdge <= shortEdge);
  return fitting.length ? fitting : [VIDEO_RENDITIONS[0]];
}

/** Output size for a rendition, keeping aspect ratio and even dimensions (H.264 requires them). */
export function renditionSize(width: number, height: number, shortEdge: number) {
  const scale = Math.min(1, shortEdge / Math.min(width, height));
  const even = (n: number) => Math.max(2, Math.round((n * scale) / 2) * 2);
  return { width: even(width), height: even(height) };
}

type ConnectionLike = { saveData?: boolean; effectiveType?: string };

/** Preferred rendition order for a visitor; the browser falls back down the list. */
export function videoSourcesForConnection(connection: ConnectionLike | undefined, screenWidth: number) {
  if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    return ['small'] as const;
  }
  if (connection?.effectiveType === '3g') return ['small', 'standard'] as const;
  if (screenWidth <= 900) return ['standard', 'small'] as const;
  return ['hq', 'standard', 'small'] as const;
}
