import { useEffect, useRef, useState } from 'react';
import { Button } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { videoSourcesForConnection } from '@/lib/media/video-sources';
import type { MediaVersion } from '@/lib/gallery/types';
import { PlayPauseIcon } from './PlayPauseIcon';

type ConnectionLike = { saveData?: boolean; effectiveType?: string };

interface GalleryVideoProps {
  src: string;
  versions?: readonly MediaVersion[];
  poster?: string | null;
  label?: string;
}

/** Hover-to-play gallery video: cover first, nothing downloads until near the screen, best version per connection. */
export function GalleryVideo({ src, versions = [], poster, label = 'A moment at Bottega' }: GalleryVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [near, setNear] = useState(false);
  const [order, setOrder] = useState<readonly string[]>(['small', 'standard']);
  const labels = restaurantContent.media;

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: ConnectionLike }).connection;
    setOrder(videoSourcesForConnection(connection, window.innerWidth));
    const player = playerRef.current;
    if (!player || !('IntersectionObserver' in window)) return setNear(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50%' },
    );
    observer.observe(player);
    return () => observer.disconnect();
  }, []);

  const sources = order.flatMap((key) => versions.filter((v) => v.key === key));

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };
  const start = () => {
    if (videoRef.current?.paused) void videoRef.current.play().catch(() => setPlaying(false));
  };

  return (
    <div
      ref={playerRef}
      className="gallery-player"
      onMouseEnter={start}
      onMouseLeave={() => videoRef.current?.pause()}
      onFocus={start}
      onBlur={() => videoRef.current?.pause()}
    >
      <video
        ref={videoRef}
        key={sources.map((s) => s.url).join('|') || src}
        src={sources.length ? undefined : src}
        poster={poster ?? undefined}
        loop
        muted
        playsInline
        preload={near ? 'metadata' : 'none'}
        aria-label={label}
        onClick={togglePlayback}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {sources.map((source) => (
          <source key={source.key} src={source.url} type="video/mp4" />
        ))}
      </video>
      <div className="gallery-play-control" data-playing={playing}>
        <Button
          variant="cream"
          size="md"
          aria-label={playing ? labels.pause : labels.play}
          title={playing ? labels.pause : labels.play}
          onClick={togglePlayback}
        >
          <PlayPauseIcon playing={playing} className="gallery-play-icon" />
        </Button>
      </div>
    </div>
  );
}
