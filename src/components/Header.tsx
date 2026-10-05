import React, { useState } from "react";
import {
  Sparkles,
  Utensils,
  Video,
  Bookmark,
  ChefHat,
  User,
  LogOut,
  ChevronDown,
  Smartphone,
} from "lucide-react";
import type { UserProfile } from "./AuthModal";
import { PWAInstallButton } from "./PWAInstallButton";

interface HeaderProps {
  activeTab: "pantry" | "recipes" | "videos" | "favorites";
  setActiveTab: (tab: "pantry" | "recipes" | "videos" | "favorites") => void;
  recipesCount: number;
  videosCount: number;
  favoritesCount: number;
  ingredientsCount: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenPublishGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  recipesCount,
  videosCount,
  favoritesCount,
  ingredientsCount,
  user,
  onOpenAuth,
  onSignOut,
  onOpenPublishGuide,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top Branding Bar */}
        <div className="flex items-center justify-between h-18 sm:h-20">
          <div
            onClick={() => setActiveTab("pantry")}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 p-1 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105">
                <img
                  src="/chef.png"
                  alt="Chef Claude logo"
                  className="w-9 h-9 object-contain drop-shadow-xs"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif-title font-semibold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                  Chef Claude
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300/40">
                  <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Smart Recipe Generator & Culinary Cooking Companion
              </p>
            </div>
          </div>

          {/* Action buttons (Install App, Pantry badge, User auth) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* PWA Install Button */}
            <PWAInstallButton onOpenStoreGuide={onOpenPublishGuide} />

            {ingredientsCount > 0 && (
              <button
                onClick={() => setActiveTab("pantry")}
                className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>🧺 Pantry:</span>
                <span className="font-bold text-stone-900">
                  {ingredientsCount} items
                </span>
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 transition-colors"
                >
                  <img
                    src={
                      user.avatarUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    }
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-stone-200"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-stone-900 line-clamp-1 max-w-[100px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-stone-500 capitalize">
                      via {user.provider}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 text-xs animate-in fade-in">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="font-bold text-stone-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-stone-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("favorites");
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center justify-between font-medium"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span>Saved Recipes</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {favoritesCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onOpenPublishGuide();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 flex items-center gap-2 font-medium"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>App Store / Play Market Guide</span>
                    </button>

                    <div className="my-1 border-t border-stone-100"></div>

                    <button
                      type="button"
                      onClick={() => {
                        onSignOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 border-t border-stone-100 py-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("pantry")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "pantry"
                ? "bg-[#141413] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Pantry & Ingredients</span>
            {ingredientsCount > 0 && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "pantry"
                    ? "bg-amber-500 text-stone-950"
                    : "bg-stone-200 text-stone-800"
                }`}
              >
                {ingredientsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("recipes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "recipes"
                ? "bg-[#d17557] text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>AI Recipes</span>
            {recipesCount > 0 && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "recipes"
                    ? "bg-white text-[#d17557]"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {recipesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "videos"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Cooking Videos</span>
            {videosCount > 0 && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "videos"
                    ? "bg-white text-rose-600"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {videosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === "favorites"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Recipes</span>
            {favoritesCount > 0 && (
              <span
                className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "favorites"
                    ? "bg-white text-amber-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
