import { useRef, useState } from 'react';
import { Button } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { PlayPauseIcon } from './PlayPauseIcon';

export function GalleryVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const labels = restaurantContent.media;

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
      className="gallery-player"
      onMouseEnter={start}
      onMouseLeave={() => videoRef.current?.pause()}
      onFocus={start}
      onBlur={() => videoRef.current?.pause()}
    >
      <video
        ref={videoRef}
        src={src}
        loop
        muted
        playsInline
        preload="metadata"
        aria-label="A moment at Bottega"
        onClick={togglePlayback}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
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
