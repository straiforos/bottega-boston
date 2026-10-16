import { describe, expect, it } from 'vitest';
import { mediaSizeError, renditionSize, renditionsFor, videoSourcesForConnection } from './video-sources';

describe('video renditions', () => {
  it('allows uploads up to 500 MB', () => {
    expect(mediaSizeError(500 * 1024 * 1024)).toBeNull();
    expect(mediaSizeError(500 * 1024 * 1024 + 1)).not.toBeNull();
  });

  it('never upscales: a 720x900 clip gets small and standard only', () => {
    expect(renditionsFor(720, 900).map((r) => r.key)).toEqual(['small', 'standard']);
  });

  it('keeps the smallest rendition even for tiny sources', () => {
    expect(renditionsFor(320, 240).map((r) => r.key)).toEqual(['small']);
  });

  it('sizes renditions by the shorter edge with even dimensions', () => {
    expect(renditionSize(1920, 1080, 480)).toEqual({ width: 854, height: 480 });
    expect(renditionSize(720, 900, 480)).toEqual({ width: 480, height: 600 });
  });

  it('serves only the small version on slow or data-saver connections', () => {
    expect(videoSourcesForConnection({ effectiveType: '2g' }, 1500)).toEqual(['small']);
    expect(videoSourcesForConnection({ saveData: true, effectiveType: '4g' }, 1500)).toEqual(['small']);
  });

  it('prefers standard on phones and high quality on fast desktops', () => {
    expect(videoSourcesForConnection({ effectiveType: '4g' }, 393)).toEqual(['standard', 'small']);
    expect(videoSourcesForConnection({ effectiveType: '4g' }, 1500)).toEqual(['hq', 'standard', 'small']);
  });
});
