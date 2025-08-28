export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, artist } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ error: "Missing title or artist" });
  }

  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${query}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "No video found" });
    }

    const priority = (video) => {
      const titleLower = video.snippet.title.toLowerCase();
      const channelLower = video.snippet.channelTitle.toLowerCase();
      const artistLower = artist.toLowerCase();

      let score = channelLower.includes(artistLower) ? 0 : 10;

      if (titleLower.includes("lyric video") || titleLower.includes("lyrics")) score += 1;
      else if (titleLower.includes("audio")) score += 2;
      else if (titleLower.includes("music video") || titleLower.includes("video")) score += 3;
      else score += 5;

      if (titleLower.includes("official")) score -= 1;

      return score;
    };

    const sorted = data.items.sort((a, b) => priority(a) - priority(b));
    const bestMatch = sorted[0];

    res.status(200).json({
      youtubeId: bestMatch.id.videoId,
    });
  } catch (error) {
    console.error("Error searching YouTube:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
