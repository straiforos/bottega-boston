/**
 * Staff-only media processing. Everything heavy is loaded on demand so visitors never download it:
 * photos run in a background worker, videos run in FFmpeg (WebAssembly), which uses its own worker.
 */
import { renditionSize, renditionsFor } from './video-sources';

export interface ProcessedVersion {
  readonly key: string;
  readonly blob: Blob;
  readonly width: number;
}

export interface ProcessedMedia {
  readonly kind: 'image' | 'video';
  readonly versions: ProcessedVersion[];
  readonly poster?: Blob;
}

type Progress = (fraction: number) => void;

export function mediaKind(file: File): 'image' | 'video' | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

function processPhoto(file: File, onProgress: Progress): Promise<ProcessedMedia> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      const message = event.data;
      if (message.type === 'progress') onProgress(message.value);
      if (message.type === 'done') resolve({ kind: 'image', versions: message.variants });
      if (message.type === 'error') reject(new Error(message.message));
      if (message.type !== 'progress') worker.terminate();
    };
    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
    worker.postMessage(file);
  });
}

function readVideoSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(url);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable video'));
    };
    video.src = url;
  });
}

async function processVideo(file: File, onProgress: Progress): Promise<ProcessedMedia> {
  const [{ FFmpeg }, { fetchFile }, coreURL, wasmURL] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/util'),
    import('@ffmpeg/core?url').then((m) => m.default),
    import('@ffmpeg/core/wasm?url').then((m) => m.default),
  ]);
  const { width, height } = await readVideoSize(file);
  const specs = renditionsFor(width, height);
  const ffmpeg = new FFmpeg();
  let step = 0;
  const steps = specs.length + 1;
  ffmpeg.on('progress', ({ progress }) => onProgress(Math.min(1, (step + Math.max(0, progress)) / steps)));
  await ffmpeg.load({ coreURL, wasmURL });
  try {
    await ffmpeg.writeFile('input', await fetchFile(file));
    const versions: ProcessedVersion[] = [];
    for (const spec of specs) {
      const size = renditionSize(width, height, spec.shortEdge);
      const out = `${spec.key}.mp4`;
      await ffmpeg.exec([
        '-i', 'input', '-an',
        '-vf', `scale=${size.width}:${size.height}`,
        '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p',
        '-b:v', `${spec.kbps}k`, '-maxrate', `${Math.round(spec.kbps * 1.4)}k`, '-bufsize', `${spec.kbps * 2}k`,
        '-movflags', '+faststart', out,
      ]);
      const data = (await ffmpeg.readFile(out)) as Uint8Array;
      versions.push({ key: spec.key, width: size.width, blob: new Blob([data.slice()], { type: 'video/mp4' }) });
      step += 1;
    }
    const cover = renditionSize(width, height, 1080);
    await ffmpeg.exec(['-i', 'input', '-frames:v', '1', '-vf', `scale=${cover.width}:${cover.height}`, '-q:v', '4', 'poster.jpg']);
    const poster = (await ffmpeg.readFile('poster.jpg')) as Uint8Array;
    onProgress(1);
    return { kind: 'video', versions, poster: new Blob([poster.slice()], { type: 'image/jpeg' }) };
  } finally {
    ffmpeg.terminate();
  }
}

export function processMedia(file: File, onProgress: Progress): Promise<ProcessedMedia> {
  const kind = mediaKind(file);
  if (kind === 'image') return processPhoto(file, onProgress);
  if (kind === 'video') return processVideo(file, onProgress);
  return Promise.reject(new Error('Unsupported file'));
}
