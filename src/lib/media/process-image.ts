/** Browser-side photo pipeline: auto-orient, strip metadata, and produce sized WebP/JPEG variants. */

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export interface ImageVariantSpec {
  readonly key: 'thumb' | 'standard' | 'hq';
  readonly maxEdge: number;
  readonly maxBytes: number;
  readonly quality: number;
}

export const IMAGE_VARIANTS: readonly ImageVariantSpec[] = [
  { key: 'thumb', maxEdge: 480, maxBytes: 200 * 1024, quality: 0.8 },
  { key: 'standard', maxEdge: 1600, maxBytes: 5 * 1024 * 1024, quality: 0.86 },
  { key: 'hq', maxEdge: 4096, maxBytes: 50 * 1024 * 1024, quality: 0.95 },
];

export function uploadSizeError(bytes: number): string | null {
  return bytes > MAX_UPLOAD_BYTES ? 'Photos can be up to 100 MB.' : null;
}

/** Scale so the longest edge fits maxEdge; never upscale. */
export function fitWithin(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob && blob.type === 'image/webp') return resolve(blob);
        canvas.toBlob((jpeg) => (jpeg ? resolve(jpeg) : reject(new Error('encode failed'))), 'image/jpeg', quality);
      },
      'image/webp',
      quality,
    );
  });
}

async function renderVariant(source: ImageBitmap, spec: ImageVariantSpec) {
  let { width, height } = fitWithin(source.width, source.height, spec.maxEdge);
  let quality = spec.quality;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, width, height);
    const blob = await encode(canvas, quality);
    if (blob.size <= spec.maxBytes) return { blob, width };
    // Over budget: drop quality first, then dimensions.
    if (quality > 0.7) quality -= 0.08;
    else ({ width, height } = fitWithin(width, height, Math.round(Math.max(width, height) * 0.8)));
  }
  throw new Error('Could not shrink photo enough');
}

export interface ProcessedImage {
  readonly key: ImageVariantSpec['key'];
  readonly blob: Blob;
  readonly width: number;
}

export async function processDishPhoto(file: File): Promise<ProcessedImage[]> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const out: ProcessedImage[] = [];
    for (const spec of IMAGE_VARIANTS) {
      const { blob, width } = await renderVariant(bitmap, spec);
      out.push({ key: spec.key, blob, width });
    }
    return out;
  } finally {
    bitmap.close();
  }
}

/** Choose which variants to offer based on the visitor's connection. */
export function variantsForConnection(connection?: { saveData?: boolean; effectiveType?: string }) {
  if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
    return ['thumb'] as const;
  }
  if (connection?.effectiveType === '3g') return ['thumb', 'standard'] as const;
  return ['thumb', 'standard', 'hq'] as const;
}
