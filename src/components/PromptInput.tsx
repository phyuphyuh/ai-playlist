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
          className="w-full p-2 px-3 rounded-full bg-stone-400 text-white border border-neutral-700 focus:outline-none focus:border-stone-500 text-lg"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-stone-500 cursor-pointer hover:bg-zinc-700 text-white p-3 px-4 font-medium rounded-full disabled:opacity-50 transition-colors"
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating..." : "Go"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </form>
  );
}
