/// <reference lib="webworker" />
import { IMAGE_VARIANTS, fitWithin, type ImageVariantSpec } from './process-image';

/** Background photo processing: auto-orient, strip metadata, encode sized versions off the main thread. */

async function encode(canvas: OffscreenCanvas, quality: number): Promise<Blob> {
  const webp = await canvas.convertToBlob({ type: 'image/webp', quality });
  if (webp.type === 'image/webp') return webp;
  return canvas.convertToBlob({ type: 'image/jpeg', quality });
}

async function render(source: ImageBitmap, spec: ImageVariantSpec) {
  let { width, height } = fitWithin(source.width, source.height, spec.maxEdge);
  let quality = spec.quality;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas unavailable');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, 0, 0, width, height);
    const blob = await encode(canvas, quality);
    if (blob.size <= spec.maxBytes) return { blob, width };
    if (quality > 0.7) quality -= 0.08;
    else ({ width, height } = fitWithin(width, height, Math.round(Math.max(width, height) * 0.8)));
  }
  throw new Error('Could not shrink photo enough');
}

self.onmessage = async (event: MessageEvent<File>) => {
  try {
    const bitmap = await createImageBitmap(event.data, { imageOrientation: 'from-image' });
    const out = [];
    for (const [index, spec] of IMAGE_VARIANTS.entries()) {
      out.push({ key: spec.key, ...(await render(bitmap, spec)) });
      self.postMessage({ type: 'progress', value: (index + 1) / IMAGE_VARIANTS.length });
    }
    bitmap.close();
    self.postMessage({ type: 'done', variants: out });
  } catch (error) {
    self.postMessage({ type: 'error', message: error instanceof Error ? error.message : 'failed' });
  }
};
