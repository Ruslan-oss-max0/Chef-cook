import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Printer, Volume2, Sparkles } from "lucide-react";

interface ClaudeRecipeMarkdownProps {
  recipeMarkdown: string;
  recipeTitle?: string;
  onCookMode?: () => void;
}

export const ClaudeRecipeMarkdown: React.FC<ClaudeRecipeMarkdownProps> = ({
  recipeMarkdown,
  recipeTitle = "Chef Recommends",
  onCookMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(recipeMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy recipe markdown:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting symbols for clean speech narration
    const cleanText = recipeMarkdown
      .replace(/[#*_`~>-]/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden"
      aria-live="polite"
    >
      {/* Top Banner */}
      <div className="bg-stone-50 border-b border-stone-200/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-serif-title font-bold text-stone-900">
              {recipeTitle}
            </h2>
            <p className="text-xs text-stone-500">
              Generated in Chef Claude's signature markdown format
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onCookMode && (
            <button
              onClick={onCookMode}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#d17557] hover:bg-[#be6345] text-white transition-colors"
            >
              Start Cook Mode
            </button>
          )}

          <button
            onClick={handleSpeak}
            title={isSpeaking ? "Stop Voice Narration" : "Read Recipe Aloud"}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              isSpeaking
                ? "bg-amber-100 border-amber-300 text-amber-900 animate-pulse"
                : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? "Pause" : "Listen"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            title="Print recipe"
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="p-6 sm:p-8 claude-markdown max-w-none">
        <ReactMarkdown>{recipeMarkdown}</ReactMarkdown>
      </div>
    </section>
  );
};
