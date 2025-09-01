import { useEffect, useRef } from "react";
import YouTube from "react-youtube";
import type { YouTubeProps, YouTubePlayer } from "react-youtube";

interface YoutubePlayerProps {
  youtubeId?: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onEnd: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlayerReady?: (player: YouTubePlayer) => void;
}

export default function YoutubePlayer({ youtubeId, isPlaying, onPlay, onPause, onEnd, onTimeUpdate, onPlayerReady }: YoutubePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);

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

  // Set up time update interval
  useEffect(() => {
    // Clear any existing interval
    if (timeUpdateIntervalRef.current !== null) {
      window.clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }

    // If we have a player reference and we want to track time
    if (playerRef.current && onTimeUpdate) {
      // Only track time when playing
      if (isPlaying) {
        timeUpdateIntervalRef.current = window.setInterval(() => {
          try {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            const duration = playerRef.current?.getDuration() || 0;

            if (duration > 0) {
              onTimeUpdate(currentTime, duration);
            }
          } catch (error) {
            console.error("Error getting player time:", error);
          }
        }, 1000); // Update every second
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeUpdateIntervalRef.current !== null) {
        window.clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    };
  }, [isPlaying, onTimeUpdate]);

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

    if (onPlayerReady) {
      onPlayerReady(event.target);
    }

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
