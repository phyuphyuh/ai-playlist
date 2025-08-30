interface Track {
  title: string;
  artist: string;
  youtubeId: string;
}

interface PlaylistProps {
  playlist: Track[];
  currentIndex: number;
  onSelectTrack: (index: number) => void;
}

export default function Playlist({ playlist, currentIndex, onSelectTrack }: PlaylistProps) {
  if (playlist.length === 0) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-4 rounded">
      <h3 className="font-bold mb-2">Generated Playlist:</h3>
      {playlist.map((track, i) => (
        <p
          key={`${track.youtubeId}-${i}`}
          className={`text-sm ${
            i === currentIndex
              ? "text-blue-400 font-semibold"
              : "text-gray-300"
          }`}
          onClick={() => onSelectTrack(i)}
        >
          {track.title} - {track.artist}
        </p>
      ))}
    </div>
  );
}
