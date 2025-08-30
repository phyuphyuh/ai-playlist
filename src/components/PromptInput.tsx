import { useState } from "react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  error: string | null;
}

export default function PromptInput({ onSubmit, loading, error }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onSubmit(prompt.trim());
    setPrompt("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your playlist..."
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-blue-500 py-2 px-4 rounded disabled:opacity-50"
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating..." : "Generate Playlist"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </form>
  );
}
