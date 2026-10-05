import React from "react";
import type { CookingVideo } from "../types/recipe";
import { Play, ExternalLink, ChefHat, Sparkles, Clock, Eye } from "lucide-react";

interface VideoGalleryProps {
  videos: CookingVideo[];
  ingredients: string[];
  onSelectVideo: (video: CookingVideo) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  ingredients,
  onSelectVideo,
}) => {
  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ChefHat className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">
          No cooking videos loaded yet
        </h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Add at least 4 ingredients in the Pantry tab and click "Get a recipe"
          to discover curated videos of chefs cooking with your ingredients.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl border border-rose-200/80 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider mb-1.5">
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span>Curated Video Masterclasses</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-900 tracking-tight">
          Watch Chefs Cook with Your Ingredients
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl font-medium">
          Step-by-step videos from prominent culinary creators (Joshua Weissman,
          Gordon Ramsay, Natasha's Kitchen, Tasty, Babish, Food Wishes) cooking
          dishes with{" "}
          <span className="font-bold text-stone-900">
            {ingredients.slice(0, 4).join(", ")}
          </span>
          {ingredients.length > 4 ? ` and more` : ""}.
        </p>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group bg-white rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Thumbnail with Play Overlay */}
            <div
              onClick={() => onSelectVideo(video)}
              className="relative aspect-video w-full bg-stone-900 overflow-hidden cursor-pointer"
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Play Button Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-13 h-13 rounded-full bg-white/90 group-hover:bg-[#d17557] group-hover:scale-110 text-stone-900 group-hover:text-white flex items-center justify-center shadow-lg transition-all duration-200 pl-0.5">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>

              {/* Duration and Views Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-white/90">
                <span className="bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-300" />
                  {video.duration}
                </span>

                <span className="bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Eye className="w-3 h-3 text-stone-300" />
                  {video.views}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                    <ChefHat className="w-3.5 h-3.5 text-amber-600" />
                    {video.channelName}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    Cooking Tutorial
                  </span>
                </div>

                <h4
                  onClick={() => onSelectVideo(video)}
                  className="text-base font-bold text-stone-900 group-hover:text-amber-900 cursor-pointer transition-colors line-clamp-2 leading-snug"
                >
                  {video.title}
                </h4>

                <p className="text-xs text-stone-500 mt-1 line-clamp-2 font-medium">
                  {video.dishHighlight}
                </p>

                {/* Key Technique Callout */}
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                  <span className="font-bold text-amber-950">Technique: </span>
                  <span className="text-stone-700">{video.techniqueSummary}</span>
                </div>

                {/* Matched Ingredients Chips */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {video.keyIngredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-700"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectVideo(video)}
                  className="px-3.5 py-2 rounded-xl bg-[#d17557] hover:bg-[#c26749] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch in App</span>
                </button>

                <a
                  href={`https://www.youtube.com/results?search_query=${video.youtubeSearchQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 text-stone-500" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
