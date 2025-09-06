export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, artist } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ error: "Missing title or artist" });
  }

  try {
    const query = encodeURIComponent(`"${title}" "${artist}"`);
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=5&q=${query}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("YouTube API URL:", url);
    console.log("YouTube API response:", JSON.stringify(data, null, 2));


    if (!data.items || data.items.length === 0) {
      const fallbackQuery = encodeURIComponent(`${title} ${artist}`);
      const fallbackUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${fallbackQuery}&key=${apiKey}`;

      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();

      if (!fallbackData.items || fallbackData.items.length === 0) {
        return res.status(404).json({ error: "No video found" });
      }

      data.items = fallbackData.items;
    }

    const priority = (video) => {
      const videoTitleLower = video.snippet.title.toLowerCase();
      const channelNameLower = video.snippet.channelTitle.toLowerCase();
      const searchArtistLower = artist.toLowerCase();
      const searchTitleLower = title.toLowerCase();

      let score = 0;

      // Check if video title contains BOTH the song title AND artist name
      if (videoTitleLower.includes(searchTitleLower) && videoTitleLower.includes(searchArtistLower)) {
        score -= 30; // Very strong preference for videos that mention both title and artist
      }
      // Or at least the title
      else if (videoTitleLower.includes(searchTitleLower)) {
        score -= 15;
      }

      // Artist matching in channel name is important
      if (channelNameLower.includes(searchArtistLower)) {
        score -= 10;
      }

      if (videoTitleLower.includes("lyric video") || videoTitleLower.includes("lyrics")) score -= 8;
      else if (videoTitleLower.includes("audio")) score -= 7;
      else if (videoTitleLower.includes("music video") || videoTitleLower.includes("video")) score -= 6;
      else score += 3;

      if (videoTitleLower.includes("official")) score -= 8;

      return score;
    };

    const sorted = data.items.sort((a, b) => priority(a) - priority(b));
    const bestMatch = sorted[0];

    res.status(200).json({
      youtubeId: bestMatch.id.videoId,
    });
  } catch (error) {
    console.error("Error searching YouTube:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    if (error.response) {
      console.error("YouTube API error details:", error.response.data);
    }

    res.status(500).json({ error: "Internal server error" });
  }
}
