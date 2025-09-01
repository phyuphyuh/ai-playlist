import { useState, useRef } from "react";
import { YouTubePlayer } from "react-youtube";
import PromptInput from './components/PromptInput';
import Playlist from './components/Playlist';
import CustomPlayer from './components/CustomPlayer';
import YoutubePlayer from './components/YoutubePlayer';
import './App.css'

interface Track {
  title: string;
  artist: string;
  youtubeId: string;
}

interface OpenAITrack {
  title: string;
  artist: string;
}

interface OpenAIResponse {
  songs?: OpenAITrack[];
  tracks?: OpenAITrack[];
  playlist?: OpenAITrack[];
}

interface YoutubeResponse {
  youtubeId: string;
}

export default function App() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const fetchOpenAIPlaylist = async (userPrompt: string): Promise<OpenAITrack[]> => {
    const response = await fetch('/api/generatePlaylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: userPrompt }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playlist from OpenAI');
    }

    const data: OpenAIResponse = await response.json();
    const tracks = data.songs || data.tracks || data.playlist || [];

    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error("No tracks received from OpenAI");
    }

    return tracks;
  };

  const fetchYoutubeId = async (track: OpenAITrack): Promise<string | null> => {
    try {
      const response = await fetch('/api/searchYoutube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: track.title, artist: track.artist }),
      });

      if (!response.ok) {
        console.warn(`YouTube search failed for: ${track.title} - ${track.artist}`);
        return null;
      }

      const data: YoutubeResponse = await response.json();
      return data.youtubeId || null;
    } catch (error) {
      console.warn(`YouTube search error for: ${track.title} - ${track.artist}`, error);
      return null;
    }
  };

  const generatePlaylist = async (prompt: string) => {
     if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const openAITracks = await fetchOpenAIPlaylist(prompt);
      const tracksWithYoutubeIds = await Promise.all(
        openAITracks.map(async (track) => {
          const youtubeId = await fetchYoutubeId(track);
          return youtubeId ? { ...track, youtubeId } : null;
        })
      );
      const validTracks = tracksWithYoutubeIds.filter((track): track is Track => track !== null);
      if (validTracks.length === 0) {
        throw new Error("No YouTube videos found for any tracks");
      }
      setPlaylist(validTracks);
      setCurrentIndex(0);
      setIsPlaying(false);

    } catch (error) {
      console.error("Error generating playlist:", error);
      setError(error instanceof Error ? error.message : "Failed to generate playlist");
    } finally {
      setLoading(false);
    }
  };

  // Player controls
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTogglePlay = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    if (playlist.length === 0) return;

    if (shuffle) {
      const newIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(newIndex);
    } else if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (loop) {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (loop) {
      setCurrentIndex(playlist.length - 1);
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleShuffle = () => setShuffle(prev => !prev);
  const handleLoop = () => setLoop(prev => !prev);

  const handleTrackEnd = () => {
    if (loop && playlist.length === 1) {
      setIsPlaying(true);
    } else {
      handleNext();
    }
  };

  const handleTimeUpdate = (time: number, totalDuration: number) => {
    setCurrentTime(time);
    setDuration(totalDuration);
  };

  const handleSeek = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time);
      setCurrentTime(time);
    }
  };

  const handlePlayerReady = (player: YouTubePlayer) => {
    playerRef.current = player;
  };

  const currentTrack = playlist[currentIndex] || null;
  const hasPlaylist = playlist.length > 0;

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <header className='text-center mb-8'>
          <h1 className="text-4xl font-bold mb-2">AI Playlist Generator</h1>
          <p className="text-gray-400">Generate custom playlists with AI</p>
        </header>

        <main className="space-y-8">
          <PromptInput
            onSubmit={generatePlaylist}
            loading={loading}
            error={error}
          />

          {hasPlaylist && (
            <>
              <Playlist
                playlist={playlist}
                currentIndex={currentIndex}
                onSelectTrack={handleSelectTrack}
              />
              <CustomPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={handlePause}
                onTogglePlay={handleTogglePlay}
                onNext={handleNext}
                onPrev={handlePrev}
                onShuffle={handleShuffle}
                onLoop={handleLoop}
                onSeek={handleSeek}
                currentTime={currentTime}
                duration={duration}
                shuffle={shuffle}
                loop={loop}
                hasNext={currentIndex < playlist.length - 1}
                hasPrev={currentIndex > 0}
                disabled={!hasPlaylist}
              />
            </>
          )}

          <YoutubePlayer
            youtubeId={currentTrack?.youtubeId}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnd={handleTrackEnd}
            onTimeUpdate={handleTimeUpdate}
            onPlayerReady={handlePlayerReady}
          />

          <div className="text-center space-y-2 text-sm text-gray-500">
            <p>Now Playing: {isPlaying.toString()} | Songs: {playlist.length}</p>
          </div>

          {/* Debug info */}
          <div className="text-center space-y-2">
            <p className="text-gray-400">
              Playlist: {playlist.length} tracks
            </p>
            <p className="text-gray-400">
              Current Index: {currentIndex}
            </p>
            <p className="text-gray-400">
              Is Playing: {isPlaying.toString()}
            </p>
            <p className="text-gray-400">
              Loading: {loading.toString()}
            </p>
            {error && (
              <p className="text-red-400 bg-red-900/20 p-3 rounded">
                Error: {error}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
