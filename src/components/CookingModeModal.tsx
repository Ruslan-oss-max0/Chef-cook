import React, { useState, useEffect, useRef } from "react";
import type { Recipe } from "../types/recipe";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  ChefHat,
  Utensils,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CookingModeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            // Play simple audio alert
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch {
      // AudioContext fallback
    }
  };

  if (!recipe) return null;

  const currentStep = recipe.instructions[currentStepIndex];
  const totalSteps = recipe.instructions.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber)
        ? prev.filter((s) => s !== stepNumber)
        : [...prev, stepNumber]
    );

    // If completing the last step, celebrate with confetti
    if (stepNumber === totalSteps && !completedSteps.includes(stepNumber)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleNext = () => {
    if (!completedSteps.includes(currentStep.step)) {
      setCompletedSteps((prev) => [...prev, currentStep.step]);
    }
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSpeakStep = () => {
    if (!("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `Step ${currentStep.step}: ${currentStep.title}. ${currentStep.description}. ${currentStep.tip ? "Chef tip: " + currentStep.tip : ""}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder
      .toString()
      .padStart(2, "0")}`;
  };

  const startQuickTimer = (mins: number) => {
    setTimerSeconds(mins * 60);
    setIsTimerRunning(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 line-clamp-1">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <span>•</span>
                <span className="font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                  {recipe.caloriesApprox || `${recipe.nutrition?.calories || "420 kcal"} (~${recipe.servingWeightGrams || 350}g)`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
            aria-label="Close cooking mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-1.5">
          <div
            className="bg-[#d17557] h-1.5 transition-all duration-300"
            style={{
              width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Step Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/40 border border-amber-200/70 shadow-xs relative">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-stone-900 text-white font-serif-title text-xl font-bold flex items-center justify-center shadow-xs">
                  {currentStep.step}
                </span>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-amber-800">
                    Active Step
                  </span>
                  <h4 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-900">
                    {currentStep.title}
                  </h4>
                </div>
              </div>

              {/* Read Aloud Button */}
              <button
                type="button"
                onClick={handleSpeakStep}
                className={`p-2.5 rounded-xl border transition-all ${
                  isSpeaking
                    ? "bg-amber-100 border-amber-300 text-amber-900 animate-pulse"
                    : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                }`}
                title={isSpeaking ? "Pause Narration" : "Read Step Aloud"}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed font-normal">
              {currentStep.description}
            </p>

            {currentStep.tip && (
              <div className="mt-5 p-3.5 rounded-2xl bg-white/90 border border-amber-200 text-xs sm:text-sm text-amber-950 font-medium flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Chef Tip:</span> {currentStep.tip}
                </div>
              </div>
            )}
          </div>

          {/* Kitchen Timer Widget */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-stone-400">
                  Kitchen Timer
                </div>
                <div className="text-2xl font-mono font-bold tracking-wider text-amber-300">
                  {formatTimer(timerSeconds)}
                </div>
              </div>
            </div>

            {/* Quick Timer presets */}
            <div className="flex flex-wrap items-center gap-2">
              {[2, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => startQuickTimer(mins)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
                >
                  +{mins}m
                </button>
              ))}

              {timerSeconds > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors"
                    title={isTimerRunning ? "Pause timer" : "Resume timer"}
                  >
                    {isTimerRunning ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Step Navigator List */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              All Recipe Steps:
            </h5>
            <div className="space-y-1.5">
              {recipe.instructions.map((step, idx) => {
                const isCompleted = completedSteps.includes(step.step);
                const isCurrent = idx === currentStepIndex;

                return (
                  <button
                    key={step.step}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                      isCurrent
                        ? "bg-amber-100 text-amber-950 font-bold border border-amber-300"
                        : isCompleted
                        ? "bg-stone-100 text-stone-500 line-through"
                        : "hover:bg-stone-100 text-stone-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepCompleted(step.step);
                        }}
                        className="cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-400" />
                        )}
                      </span>
                      <span>
                        {step.step}. {step.title}
                      </span>
                    </span>

                    {step.estimatedMinutes && (
                      <span className="text-[10px] text-stone-500">
                        {step.estimatedMinutes}m
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={() => toggleStepCompleted(currentStep.step)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-1.5 transition-colors ${
              completedSteps.includes(currentStep.step)
                ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                : "bg-white border-stone-300 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {completedSteps.includes(currentStep.step)
                ? "Completed"
                : "Mark Step Done"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#d17557] hover:bg-[#c26749] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>{isLastStep ? "Finish Cooking 🎉" : "Next Step"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
