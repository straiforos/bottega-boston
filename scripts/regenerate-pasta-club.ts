#!/usr/bin/env bun
/**
 * Regenerates the Pasta Club woman cutout with Gemini image edit.
 * Source: export/local-media/.../pasta-club.png (or LOVABLE bundled copy).
 * Output: tmp/pasta-club-regen/ — review before replacing the live asset.
 *
 * Usage: bun scripts/regenerate-pasta-club.ts
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'tmp/pasta-club-regen');
/** Successor to gemini-3.1-flash-image (deprecated / shutting down). */
const GEMINI_MODEL = 'gemini-nano-banana-2.1';
const SOURCE = path.join(
  root,
  'export/local-media/a/v1/122eb82d-0dcb-4681-bbd6-9e6446b687c2/f6338295-8313-4b08-be15-17a1b79d5be5/pasta-club.png',
);

const PROMPT = [
  'Edit this restaurant marketing photo of a woman eating pasta for Bottega Pasta Club.',
  'Keep the same woman, face, hair, clothing, pose, plate of pasta, and photographic style — same person, not a redesign.',
  'Widen the frame so her left elbow and full left arm are fully visible with comfortable padding. Nothing clipped at the edges; outpaint the clipped side as needed.',
  'Return a clean cutout of the subject on a fully transparent background (RGBA PNG). Soft natural edges — no checkerboard, no gray fringe, no color halo, no leftover backdrop.',
  'Do not add text, logos, captions, or UI chrome. Do not invent new props or change the pasta.',
].join(' ');

async function editWithGemini(apiKey: string, sourceBytes: Uint8Array, prompt: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: Buffer.from(sourceBytes).toString('base64'),
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          // Match current asset (~1264×843); leave horizontal room for the elbow.
          imageConfig: { aspectRatio: '3:2', imageSize: '2K' },
        },
      }),
    },
  );
  const payload = (await response.json()) as {
    error?: { message?: string };
    candidates?: Array<{
      finishReason?: string;
      content?: {
        parts?: Array<{
          text?: string;
          inlineData?: { data?: string; mimeType?: string };
          inline_data?: { data?: string; mime_type?: string };
        }>;
      };
    }>;
  };
  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini HTTP ${response.status}`);
  }
  const candidate = payload.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  for (const part of parts) {
    if (part.text) console.log('model:', part.text.slice(0, 240));
  }
  for (const part of parts) {
    const data = part.inlineData?.data ?? part.inline_data?.data;
    if (!data) continue;
    const mimeType = part.inlineData?.mimeType ?? part.inline_data?.mime_type ?? 'image/png';
    return { bytes: Buffer.from(data, 'base64'), mimeType };
  }
  const reason = candidate?.finishReason ? ` (finishReason=${candidate.finishReason})` : '';
  throw new Error(`Gemini response had no image${reason}`);
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('Set GEMINI_API_KEY in .env before running this script');

  await mkdir(outDir, { recursive: true });
  const sourceBytes = await readFile(SOURCE);
  await writeFile(path.join(outDir, 'pasta-club-source.png'), sourceBytes);
  console.log(`Source ${SOURCE} (${sourceBytes.byteLength} bytes)`);
  console.log(`Model ${GEMINI_MODEL}`);

  const { bytes, mimeType } = await editWithGemini(apiKey, sourceBytes, PROMPT);
  const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
  const outPath = path.join(outDir, `pasta-club-regen.${ext}`);
  await writeFile(outPath, bytes);
  console.log(`Wrote ${outPath} (${bytes.byteLength} bytes, ${mimeType})`);
  console.log('Review that file before replacing export/local-media or the CDN asset.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
