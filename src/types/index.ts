export interface Track {
  title: string;
  artist: string;
  youtubeId: string;
}

export interface OpenAITrack {
  title: string;
  artist: string;
}

export interface OpenAIResponse {
  songs?: OpenAITrack[];
  tracks?: OpenAITrack[];
  playlist?: OpenAITrack[];
}

export interface YoutubeResponse {
  youtubeId: string;
}

export type LoopMode = "none" | "playlist" | "single";
