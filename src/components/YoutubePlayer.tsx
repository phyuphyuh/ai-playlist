import { useEffect, useRef, useCallback } from "react";
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

  // Function to start time tracking
  const startTimeTracking = useCallback(() => {
    if (timeUpdateIntervalRef.current !== null) {
      window.clearInterval(timeUpdateIntervalRef.current);
    }

    if (playerRef.current && onTimeUpdate) {
      timeUpdateIntervalRef.current = window.setInterval(() => {
        try {
          if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime() || 0;
            const duration = playerRef.current.getDuration() || 0;

            if (duration > 0) {
              onTimeUpdate(currentTime, duration);
            }
          }
        } catch (error) {
          console.error("Error getting player time:", error);
        }
      }, 1000);
    }
  }, [onTimeUpdate]);

  // Function to stop time tracking
  const stopTimeTracking = useCallback(() => {
    if (timeUpdateIntervalRef.current !== null) {
      window.clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  }, []);

  // Cleanup function to destroy player and clear intervals
  const cleanup = useCallback(() => {
    stopTimeTracking();

    // Destroy the YouTube player instance
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn("Error destroying YouTube player:", error);
      }
      playerRef.current = null;
    }
  }, [stopTimeTracking]);

  // Clean up when component unmounts or youtubeId changes
  useEffect(() => {
    return cleanup;
  }, [youtubeId, cleanup]);

  // Handle play/pause state changes
  useEffect(() => {
    if (!playerRef.current) {
      return;
    }

    try {
      if (isPlaying) {
        playerRef.current.playVideo();
        startTimeTracking();
    } else {
        playerRef.current.pauseVideo();
        stopTimeTracking();
      }
    } catch (error) {
      console.error("Error controlling YouTube player:", error);
    }
  }, [isPlaying, startTimeTracking, stopTimeTracking]);

  // Handle player ready event
  const onReady = useCallback((event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    console.log('YouTube player ready');

    if (onPlayerReady) {
      onPlayerReady(event.target);
    }

    if (isPlaying) {
      try {
        event.target.playVideo();
        startTimeTracking();
      } catch (error) {
        console.error("Error playing video on ready:", error);
      }
    }
  }, [isPlaying, onPlayerReady, startTimeTracking]);

  // Handle state changes
  const onStateChange = useCallback((event: { target: YouTubePlayer; data: number }) => {
    const { data: playerState } = event;

    // YouTube Player States: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (playerState === 1) {
      onPlay();
      startTimeTracking();
    } else if (playerState === 2) {
      onPause();
      stopTimeTracking();
    } else if (playerState === 0) {
      stopTimeTracking();
      onEnd();
    } else if (playerState === 5) {
      // Video cued, new vid ready
      if (isPlaying) {
        startTimeTracking();
      }
    }
  }, [onPlay, onPause, onEnd, isPlaying, startTimeTracking, stopTimeTracking]);

  // Handle player errors
  const onError = useCallback((event: { target: YouTubePlayer; data: number }) => {
    console.error('YouTube player error:', event.data);
    stopTimeTracking();
    onEnd(); // Skip to next track on error
  }, [onEnd, stopTimeTracking]);

  return (
    <div className="hidden">
      {youtubeId && (
        <YouTube
          key={`youtube-player-${youtubeId}`}
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
