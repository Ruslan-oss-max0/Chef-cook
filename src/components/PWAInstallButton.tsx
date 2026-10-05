import React, { useState } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, Smartphone, X, Apple, Play } from "lucide-react";

interface PWAInstallButtonProps {
  onOpenStoreGuide?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenStoreGuide,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, still provide Store Guide access
  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={onOpenStoreGuide}
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors"
      >
        <Smartphone className="w-3.5 h-3.5 text-stone-500" />
        <span>App Stores Info</span>
      </button>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#d17557] hover:bg-[#c26749] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 transition-colors cursor-pointer"
        >
          <Apple className="w-3.5 h-3.5 text-stone-900" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 relative">
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
                <img src="/chef.png" alt="Chef logo" className="w-8 h-8 object-contain" />
              </div>

              <h3 className="text-lg font-serif-title font-bold text-stone-900">
                Install Chef Claude on iPhone
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                Add Chef Claude to your home screen for full-screen cooking mode without browser tabs:
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2 text-stone-800">
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button in Safari's bottom toolbar.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                  <span>Open Chef Claude from your home screen like any native app!</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop or non-Chromium browsers: button to open publishing/install guide
  return (
    <button
      type="button"
      onClick={onOpenStoreGuide}
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
      title="How to install or get on App Store & Google Play"
    >
      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
      <span>Get App</span>
    </button>
  );
};
