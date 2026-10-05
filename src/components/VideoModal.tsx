import React from "react";
import type { CookingVideo } from "../types/recipe";
import { X, ExternalLink, ChefHat, Sparkles } from "lucide-react";

interface VideoModalProps {
  video: CookingVideo | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 line-clamp-1">
                {video.title}
              </h4>
              <p className="text-xs text-stone-500 font-medium">
                {video.channelName} • {video.duration} • {video.views}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={video.youtubeEmbedUrl || `https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?autoplay=1`}
            title={video.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Details & Actions Footer */}
        <div className="p-5 sm:p-6 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Culinary Technique Highlight:</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 font-medium">
                {video.techniqueSummary}
              </p>
            </div>

            <a
              href={`https://www.youtube.com/results?search_query=${video.youtubeSearchQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            </a>
          </div>

          {/* Key ingredients matched */}
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">
              Ingredients featured in this video:
            </span>
            {video.keyIngredients.map((ing, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
