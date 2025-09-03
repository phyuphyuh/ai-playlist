import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faForward, faBackward, faShuffle, faRepeat } from '@fortawesome/free-solid-svg-icons';

interface Track {
  title: string;
  artist: string;
  youtubeId: string;
}

interface CustomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  onLoop: () => void;
  onSeek?: (time: number) => void;
  currentTime?: number;
  duration?: number;
  shuffle: boolean;
  loopMode: "none" | "playlist" | "single";
  hasNext: boolean;
  hasPrev: boolean;
  disabled: boolean;
}

export default function CustomPlayer({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrev,
  onShuffle,
  onLoop,
  onSeek,
  currentTime = 0,
  duration = 0,
  shuffle,
  loopMode,
  hasNext,
  hasPrev,
  disabled
}: CustomPlayerProps) {
  const [seekValue, setSeekValue] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update the seek slider value when currentTime changes (if not dragging)
  useEffect(() => {
    if (!isDragging && duration > 0) {
      setSeekValue((currentTime / duration) * 100);
    }
  }, [currentTime, duration, isDragging]);

  // Handle seek interactions
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
  };

  const handleSeekStart = () => {
    setIsDragging(true);
  };

  const handleSeekEnd = () => {
    if (onSeek && duration > 0) {
      const seekTime = (seekValue / 100) * duration;
      onSeek(seekTime);
    }
    setIsDragging(false);
  };

  if (!currentTrack || disabled) {
    return null;
  }

  const renderLoopButton = () => {
    let title, textColor;

    switch(loopMode) {
      case "playlist":
        textColor = "text-blue-400 bg-blue-400/20";
        title = "Loop Playlist";
        break;
      case "single":
        textColor = "text-blue-400 bg-blue-400/20";
        title = "Loop Current Track";
        break;
      default:
        textColor = "text-gray-400 hover:text-white hover:bg-gray-700";
        title = "Loop Off";
    }

    return (
      <button
        onClick={onLoop}
        className={`p-2 rounded-full transition-colors ${textColor}`}
        title={title}
      >
        <div className="relative inline-block">
          <FontAwesomeIcon icon={faRepeat} />
          {loopMode === "single" && (
            <span className="absolute text-xs font-bold" style={{
              bottom: '-3px',
              right: '-3px'
            }}>1</span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Track Info */}
        <div className="text-center mb-4">
          <h3 className="text-white font-medium text-lg">
            {currentTrack.title}
          </h3>
          <p className="text-gray-400 text-sm">
            {currentTrack.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 flex items-center space-x-2">
          <span className="text-gray-400 text-xs w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={seekValue}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchStart={handleSeekStart}
            onTouchEnd={handleSeekEnd}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${seekValue}%, #4b5563 ${seekValue}%, #4b5563 100%)`
            }}
          />
          <span className="text-gray-400 text-xs w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6">
          {/* Shuffle */}
          <button
            onClick={onShuffle}
            className={`p-2 rounded-full transition-colors ${
              shuffle
                ? "text-blue-400 bg-blue-400/20"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
            title="Shuffle"
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>

          {/* Previous */}
          <button
            onClick={onPrev}
            disabled={!hasPrev && loopMode !== "playlist"}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Previous"
          >
            <FontAwesomeIcon icon={faBackward} />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            disabled={!hasNext && loopMode !== "playlist"}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 disabled:text-gray-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
            title="Next"
          >
            <FontAwesomeIcon icon={faForward} />
          </button>

          {/* Loop */}
          {renderLoopButton()}
        </div>
      </div>
    </div>
  );
}
