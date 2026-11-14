#!/usr/bin/env bun
/**
 * One-shot Gemini image edit for Bottega media (hero, lifestyle, menu polish, cutouts).
 * Reads GEMINI_API_KEY from the environment (Bun loads .env). Writes under --out only —
 * never overwrites live CDN/export assets; promote after visual review.
 *
 * Usage:
 *   bun scripts/gemini-edit-image.ts --out tmp/hero-regen/out.jpg --aspect 3:2 \
 *     --prompt "..." source.png ref.jpg
 *   bun scripts/gemini-edit-image.ts --out tmp/x/out.jpg --prompt-file prompt.txt a.png b.jpg
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Successor to gemini-3.1-flash-image (deprecated / shutting down). */
const DEFAULT_MODEL = 'gemini-nano-banana-2.1';

const ASPECTS = new Set(['1:1', '3:2', '2:3', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9']);

type Args = {
  out: string;
  prompt: string;
  promptFile: string;
  images: string[];
  model: string;
  aspect: string;
  size: string;
};

function usage(): never {
  console.error(`Usage: bun scripts/gemini-edit-image.ts --out <path> (--prompt TEXT | --prompt-file FILE) [--aspect 3:2] [--size 2K] [--model ${DEFAULT_MODEL}] <image> [image...]`);
  process.exit(1);
}

function mimeFor(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  return 'image/jpeg';
}

function parseArgs(argv: string[]): Args {
  let out = '';
  let prompt = '';
  let promptFile = '';
  let model = DEFAULT_MODEL;
  let aspect = '1:1';
  let size = '2K';
  const images: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const v = argv[++i];
      if (!v) usage();
      return v;
    };
    if (arg === '--out') out = next();
    else if (arg === '--prompt') prompt = next();
    else if (arg === '--prompt-file') promptFile = next();
    else if (arg === '--model') model = next();
    else if (arg === '--aspect') aspect = next();
    else if (arg === '--size') size = next();
    else if (arg === '--help' || arg === '-h') usage();
    else if (arg.startsWith('-')) {
      console.error(`Unknown flag: ${arg}`);
      usage();
    } else images.push(arg);
  }

  if (!out || images.length === 0) usage();
  if (!prompt && !promptFile) usage();
  if (prompt && promptFile) {
    console.error('Pass only one of --prompt or --prompt-file');
    usage();
  }
  if (!ASPECTS.has(aspect)) {
    console.error(`Unsupported --aspect ${aspect}. Use one of: ${[...ASPECTS].join(', ')}`);
    process.exit(1);
  }

  return { out, prompt, promptFile, images, model, aspect, size };
}

async function editWithGemini(
  apiKey: string,
  model: string,
  prompt: string,
  images: Array<{ bytes: Uint8Array; mimeType: string }>,
  aspect: string,
  size: string,
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              ...images.map((img) => ({
                inline_data: {
                  mime_type: img.mimeType,
                  data: Buffer.from(img.bytes).toString('base64'),
                },
              })),
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio: aspect, imageSize: size },
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
    if (part.text) console.log('model:', part.text.slice(0, 300));
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
  const args = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('Set GEMINI_API_KEY in .env before running this script');

  const prompt = args.promptFile
    ? (await readFile(args.promptFile, 'utf8')).trim()
    : args.prompt.trim();
  if (!prompt) throw new Error('Prompt is empty');

  const images = await Promise.all(
    args.images.map(async (file) => {
      const bytes = await readFile(file);
      return { file, bytes, mimeType: mimeFor(file) };
    }),
  );

  await mkdir(path.dirname(path.resolve(args.out)), { recursive: true });

  console.log(`Model ${args.model} aspect=${args.aspect} size=${args.size}`);
  for (const img of images) {
    console.log(`Input ${img.file} (${img.bytes.byteLength} bytes, ${img.mimeType})`);
  }

  const { bytes, mimeType } = await editWithGemini(
    apiKey,
    args.model,
    prompt,
    images,
    args.aspect,
    args.size,
  );

  let outPath = args.out;
  const wantExt = mimeType.includes('jpeg') || mimeType.includes('jpg') ? '.jpg' : mimeType.includes('png') ? '.png' : path.extname(args.out) || '.jpg';
  if (!path.extname(outPath)) outPath = `${outPath}${wantExt}`;
  await writeFile(outPath, bytes);
  console.log(`Wrote ${outPath} (${bytes.byteLength} bytes, ${mimeType})`);
  console.log('Review with the Read tool before replacing any live export/CDN asset.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
