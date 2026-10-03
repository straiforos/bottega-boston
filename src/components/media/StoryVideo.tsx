import { useEffect, useRef, useState } from 'react';
import { Button, PillLabel } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { PlayPauseIcon } from './PlayPauseIcon';
import storyCaptions from '@/content/en/story-captions.vtt?url';

export function StoryVideo({ src, poster }: { src: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState('');
  const reducedMotion = usePrefersReducedMotion();
  const labels = restaurantContent.media;

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  // The VTT track stays attached for screen readers, but the browser's default
  // caption rendering is hidden; our own styled overlay follows the active cue.
  useEffect(() => {
    const track = videoRef.current?.textTracks[0];
    if (!track) return;
    track.mode = 'hidden';
    const updateCaption = () => {
      const cues = Array.from(track.activeCues ?? []);
      setCaption(cues.map((cue) => cue.text ?? '').join(' '));
    };
    updateCaption();
    track.addEventListener('cuechange', updateCaption);
    return () => track.removeEventListener('cuechange', updateCaption);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      videoRef.current?.pause();
      setPlaying(false);
    }
  }, [reducedMotion]);

  return (
    <div className="story-player">
      <div className="arch-video">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          autoPlay={!reducedMotion}
          loop
          playsInline
          preload="metadata"
          aria-label="Making fresh pasta together at Bottega"
          onClick={togglePlayback}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <track kind="captions" src={storyCaptions} srcLang="en" label="English" />
        </video>
        {caption && (
          <div className="video-captions">
            <PillLabel variant="mustard">{caption}</PillLabel>
          </div>
        )}
        <div className="video-play-control" data-playing={playing}>
          <Button
            variant="cream"
            size="lg"
            aria-label={playing ? labels.pause : labels.play}
            title={playing ? labels.pause : labels.play}
            onClick={togglePlayback}
          >
            <PlayPauseIcon playing={playing} className="video-play-icon" />
          </Button>
        </div>
        <div className="video-sound-control">
          <Button
            variant="cream"
            size="sm"
            aria-pressed={!muted}
            aria-label={muted ? labels.soundOn : labels.soundOff}
            title={muted ? labels.soundOn : labels.soundOff}
            onClick={() => setMuted((value) => !value)}
          >
            <svg
              className="video-sound-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 5 6 9H3v6h3l5 4z" />
              {muted ? (
                <path d="m16 9 5 6m0-6-5 6" />
              ) : (
                <>
                  <path d="M15 8a6 6 0 0 1 0 8" />
                  <path d="M18 5a10 10 0 0 1 0 14" />
                </>
              )}
            </svg>
          </Button>
        </div>
        <div className="video-caption">
          <PillLabel variant="mustard">About us</PillLabel>
        </div>
      </div>
    </div>
  );
}
