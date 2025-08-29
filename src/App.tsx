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

// interface OpenAITrack {
//   title: string;
//   artist: string;
// }

export default function App() {
  // const [playlist, setPlaylist] = useState<Track[]>([]);
  // const [currentIndex, setCurrentIndex] = useState<number>(0);
  // const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <div className='container mx-auto px-4 py-8'>
        <header className='text-center mb-8'>
          <h1 className="text-4xl font-bold mb-2">AI Playlist Generator</h1>
          <p className="text-gray-400">Generate custom playlists with AI</p>
        </header>
      </div>
    </div>
  )
}
