import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

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
    <div className="bg-neutral-700 p-6 rounded-lg h-full flex flex-col">
      <h3 className="font-bold text-xl mb-4">Your Playlist:</h3>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full">
          <tbody>
            {playlist.map((track, i) => (
              <tr
                key={`${track.youtubeId}-${i}`}
                className={`border-b border-stone-700 last:border-0 cursor-pointer hover:bg-stone-700/50 transition-colors ${
                  i === currentIndex
                    ? "bg-stone-800/30"
                    : ""
                }`}
                onClick={() => onSelectTrack(i)}
              >
                <td className="py-3 px-3 pr-2">
                  <div className="flex items-center">
                    {i === currentIndex && (
                      <div className="mr-2 text-sone-400">
                        <FontAwesomeIcon icon={faPlay} size="xs" />
                      </div>
                    )}
                    <span className={`${i === currentIndex ? "text-sone-300 font-medium" : "text-white"}`}>
                      {track.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-stone-300 text-sm">
                    {track.artist}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
