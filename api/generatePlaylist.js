import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing required field" });
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system",
          content: "You are a music expert with deep knowledge of all genres, eras, and artists. Generate a playlist of 10 songs according to the user's request and preferences. Consider mood, tempo, and popularity. Always return as a JSON array of { title, artist }. Do not include any explanations, commentary, or additional text."
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object"},
      max_tokens: 500,
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? "{}");

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error generating playlist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
