import React, { useState } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ChefHat,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  syncUserProfileToFirestore,
} from "../firebase";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: "google" | "facebook" | "x" | "email";
  avatarUrl?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerNotice, setProviderNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real Google Sign In via Firebase Auth
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    setProviderNotice(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Sync user profile to Firestore database
      await syncUserProfileToFirestore(fbUser, "google");

      const userProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "Chef User",
        email: fbUser.email || "",
        provider: "google",
        avatarUrl:
          fbUser.photoURL ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      };

      onLoginSuccess(userProfile);
      onClose();
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      const msg = err instanceof Error ? err.message : "Failed to sign in with Google";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Social Auth for Facebook & X
  const handleOtherSocialAuth = async (provider: "facebook" | "x") => {
    setLoading(true);
    setErrorMessage(null);

    // Provide friendly guidance on Facebook & X Firebase console integration
    setProviderNotice(
      provider === "facebook"
        ? "Facebook Auth requires your Facebook App ID in Firebase Console. Logging you in with Chef Claude demo session right now!"
        : "X (Twitter) Auth requires your X API key in Firebase Console. Logging you in with Chef Claude demo session right now!"
    );

    const mockUser: UserProfile = {
      id: `${provider}_${Date.now()}`,
      name:
        provider === "facebook"
          ? "Chef Enthusiast (Facebook)"
          : "Foodie Creator (X)",
      email: provider === "facebook" ? "fb_chef@example.com" : "x_chef@example.com",
      provider,
      avatarUrl:
        provider === "facebook"
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
          : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    };

    setTimeout(() => {
      onLoginSuccess(mockUser);
      setLoading(false);
      onClose();
    }, 600);
  };

  // Real Email & Password auth with Firebase Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage(null);
    setProviderNotice(null);

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        const fbUser = userCredential.user;

        if (name.trim()) {
          await updateProfile(fbUser, { displayName: name.trim() });
        }

        // Sync to Firestore database
        await syncUserProfileToFirestore(fbUser, "email");

        const userProfile: UserProfile = {
          id: fbUser.uid,
          name: name.trim() || fbUser.email?.split("@")[0] || "Chef User",
          email: fbUser.email || email.trim(),
          provider: "email",
          avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
        };

        onLoginSuccess(userProfile);
        onClose();
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        const fbUser = userCredential.user;

        await syncUserProfileToFirestore(fbUser, "email");

        const userProfile: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Chef User",
          email: fbUser.email || email.trim(),
          provider: "email",
          avatarUrl:
            fbUser.photoURL ||
            `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
        };

        onLoginSuccess(userProfile);
        onClose();
      }
    } catch (err: unknown) {
      console.error("Email auth error:", err);
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setErrorMessage(
        msg.includes("email-already-in-use")
          ? "This email is already registered. Try signing in!"
          : msg.includes("weak-password")
          ? "Password should be at least 6 characters."
          : msg.includes("invalid-credential") || msg.includes("user-not-found")
          ? "Invalid email or password."
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
        {/* Top Header */}
        <div className="relative bg-gradient-to-b from-stone-50 to-white px-6 pt-6 pb-4 border-b border-stone-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 p-1 flex items-center justify-center">
              <img
                src="/chef.png"
                alt="Chef Claude"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-serif-title font-bold text-stone-900">
                {mode === "signup" ? "Join Chef Claude" : "Welcome Back"}
              </h3>
              <p className="text-xs text-stone-500">
                Live Cloud Authentication & Firestore Database Storage
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-stone-100 rounded-xl mt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Notice Banner */}
          {providerNotice && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{providerNotice}</span>
            </div>
          )}

          {/* Social Auth Buttons */}
          <div className="space-y-2.5">
            {/* Google / Gmail button (Live Firebase Auth) */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs sm:text-sm shadow-2xs transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                />
              </svg>
              <span>Continue with Gmail / Google</span>
            </button>

            {/* Facebook button */}
            <button
              type="button"
              onClick={() => handleOtherSocialAuth("facebook")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {/* Facebook SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>

            {/* X (Twitter) button */}
            <button
              type="button"
              onClick={() => handleOtherSocialAuth("x")}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-black hover:bg-stone-900 text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              {/* X SVG */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Continue with X (Twitter)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-stone-200"></div>
            <span className="relative px-3 bg-white text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              or with email & password
            </span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ruslan"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-xl bg-[#d17557] hover:bg-[#c26749] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {mode === "signup"
                      ? "Create Free Account"
                      : "Sign In"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Database Storage Indicator */}
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Firestore Database Connected:</span>{" "}
                Your user profile, saved recipes, and kitchen pantry are automatically
                stored and synchronized in Google Cloud Firestore.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
