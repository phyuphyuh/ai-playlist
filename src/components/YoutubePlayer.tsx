import { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import type { YouTubeProps, YouTubePlayer } from "react-youtube";

interface YoutubePlayerProps {
  youtubeId?: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnd: () => void;
}

export default function YoutubePlayer({ youtubeId, isPlaying, onPlay, onPause, onEnd }: YoutubePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);

  // Configure YouTube player options
  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  // Handle play/pause state changes
  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Handle player ready event
  const onReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    console.log('YouTube player ready');

    if (isPlaying) {
      event.target.playVideo();
    }
  };

  // Handle state changes
  const onStateChange = (event: { target: YouTubePlayer; data: number }) => {
    const { data: playerState } = event;

    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (playerState === 1) {
      onPlay();
    } else if (playerState === 2) {
      onPause();
    } else if (playerState === 0) {
      onEnd();
    }
  };

  // Handle player errors
  const onError = (event: { target: YouTubePlayer; data: number }) => {
    console.error('YouTube player error:', event.data);
    onEnd(); // Skip to next track on error
  };

  return (
    <div className="hidden">
      {youtubeId && (
        <YouTube
          key={youtubeId}
          videoId={youtubeId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          onError={onError}
        />
      )}
    </div>
  );
}
