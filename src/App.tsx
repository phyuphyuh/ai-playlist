import { useState } from 'react'
// import PromptInput from './components/PromptInput';
// import Playlist from './components/Playlist';
// import CustomPlayer from './components/CustomPlayer';
// import YoutubePlayer from './components/YoutubePlayer';
import './App.css'

export interface Track {
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleTestAPI = () => {
    generatePlaylist("upbeat pop songs from the 2000s");
  };

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <header className='text-center mb-8'>
          <h1 className="text-4xl font-bold mb-2">AI Playlist Generator</h1>
          <p className="text-gray-400">Generate custom playlists with AI</p>
        </header>

        <main className="space-y-8">
          {/* Test button */}
          <div className="text-center">
            <button
              onClick={handleTestAPI}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg"
            >
              {loading ? "Testing API..." : "Test API"}
            </button>
          </div>

          {/* Debug info */}
          <div className="text-center space-y-2">
            <p className="text-gray-400">
              Playlist: {playlist.length} tracks
            </p>
            <p className="text-gray-400">
              Loading: {loading.toString()}
            </p>
            {error && (
              <p className="text-red-400 bg-red-900/20 p-3 rounded">
                Error: {error}
              </p>
            )}
            {playlist.length > 0 && (
              <div className="text-left max-w-md mx-auto bg-gray-800 p-4 rounded">
                <h3 className="font-bold mb-2">Generated Playlist:</h3>
                {playlist.map((track, i) => (
                  <p key={i} className="text-sm text-gray-300">
                    {track.title} - {track.artist}
                  </p>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
