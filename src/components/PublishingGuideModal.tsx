import React, { useState } from "react";
import {
  X,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Apple,
  ShieldCheck,
  Key,
  Layers,
} from "lucide-react";

interface PublishingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const PublishingGuideModal: React.FC<PublishingGuideModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [activeTab, setActiveTab] = useState<"playstore" | "appstore" | "auth">(
    "playstore"
  );
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-stone-50 via-amber-50/40 to-orange-50/30 border-b border-stone-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full mb-1">
                Store Packaging & Distribution Guide
              </div>
              <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-stone-900">
                Publishing to App Store & Google Play
              </h3>
              <p className="text-xs text-stone-500">
                Step-by-step roadmap to package Chef Claude into native iOS and Android store apps
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("playstore")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "playstore"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-current" />
            <span>Google Play Market (.aab)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appstore")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "appstore"
                ? "border-stone-900 text-stone-900 bg-white rounded-t-xl"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-stone-900 fill-current" />
            <span>Apple App Store (iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("auth")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "auth"
                ? "border-amber-600 text-amber-800 bg-white rounded-t-xl"
                : "border-transparent text-stone-500 hover:text-stone-800"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>Social Auth in Mobile Stores</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-stone-700 text-xs sm:text-sm">
          {/* App URL Copy Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-bold text-stone-900 text-xs">
                Your Live Production Web App URL:
              </p>
              <code className="text-[11px] font-mono text-amber-900 break-all select-all">
                {appUrl}
              </code>
            </div>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy App URL</span>
                </>
              )}
            </button>
          </div>

          {/* TAB 1: Google Play Store */}
          {activeTab === "playstore" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-stone-900">
                  Packaging for Google Play Market via Trusted Web Activity (TWA)
                </h4>
                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Open PWABuilder</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-stone-600 leading-relaxed">
                Google Play officially supports PWAs as native Android apps using <strong>Trusted Web Activities (TWA)</strong>. The app runs in a native Android shell with full hardware acceleration, offline caching, and zero browser chrome.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-stone-900">Enter Your URL on PWABuilder</h5>
                    <p className="text-stone-600 mt-0.5">
                      Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="underline font-semibold text-emerald-700">pwabuilder.com</a> and enter your live URL. PWABuilder tests the PWA manifest, service worker, and icons.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-stone-900">Click "Package for Android"</h5>
                    <p className="text-stone-600 mt-0.5">
                      Click <strong>Package for Store</strong> and select <strong>Android</strong>. Set your Package ID (e.g. <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">com.chefclaude.app</code>). PWABuilder compiles and signs your <strong>.aab (Android App Bundle)</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-stone-900">Upload to Google Play Console</h5>
                    <p className="text-stone-600 mt-0.5">
                      Open your <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="underline font-semibold text-emerald-700">Google Play Console</a> account, create an App, and upload the generated <code className="font-mono text-emerald-900 bg-emerald-50 px-1 rounded">.aab</code> file to Production or Closed Testing track!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Apple App Store */}
          {activeTab === "appstore" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-stone-900">
                  Publishing to Apple App Store via Capacitor or PWABuilder iOS
                </h4>
                <a
                  href="https://capacitorjs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-stone-900 hover:text-stone-700"
                >
                  <span>Capacitor Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-stone-600 leading-relaxed">
                Apple requires all apps distributed through the iOS App Store to be packaged in an Xcode project container (IPA) using a native WebKit container like <strong>Capacitor</strong>.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h5 className="font-bold text-stone-900">Export via PWABuilder iOS or Capacitor</h5>
                    <p className="text-stone-600 mt-0.5">
                      On <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="underline font-semibold text-stone-900">pwabuilder.com</a>, choose <strong>iOS</strong> to generate a complete Xcode project archive ready to open on macOS.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h5 className="font-bold text-stone-900">Open in Xcode on Mac</h5>
                    <p className="text-stone-600 mt-0.5">
                      Double-click the generated project in Xcode, select your Apple Developer Team under <em>Signing & Capabilities</em>, and set the bundle ID (e.g. <code className="bg-stone-200 px-1 py-0.5 rounded text-[11px]">com.chefclaude.ios</code>).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h5 className="font-bold text-stone-900">Archive & Submit to App Store Connect</h5>
                    <p className="text-stone-600 mt-0.5">
                      In Xcode menu: click <strong>Product &gt; Archive</strong>, then <strong>Distribute App &gt; App Store Connect</strong>. Your app will appear in TestFlight within minutes!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Social Auth in Mobile Stores */}
          {activeTab === "auth" && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-stone-900">
                Authorising via Gmail, Facebook, and Twitter/X on Mobile Stores
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Gmail / Google Sign-In</span>
                  </div>
                  <p className="text-stone-600 text-xs">
                    Works automatically out-of-the-box. When building the Android app, copy your <strong>SHA-1 Fingerprint</strong> from Google Play Console into your Firebase Project settings so native Google Play validates the signature.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Facebook Login</span>
                  </div>
                  <p className="text-stone-600 text-xs">
                    In <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="underline text-blue-600 font-semibold">Meta for Developers</a>, add your App ID & Secret into Firebase Console. In Facebook Settings &gt; Basic, add the Android package name and iOS Bundle ID.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-900">
                    <CheckCircle2 className="w-4 h-4 text-stone-900" />
                    <span>Twitter / X Login</span>
                  </div>
                  <p className="text-stone-600 text-xs">
                    In the <a href="https://developer.x.com" target="_blank" rel="noreferrer" className="underline text-stone-900 font-semibold">X Developer Portal</a>, enable OAuth 2.0 with Read permissions and add the Firebase redirect URI.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Apple App Store Review Rule (Guideline 4.8)</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Apple requires that any iOS app offering 3rd-party social login (Facebook, Google, X) must also provide standard <strong>Email Sign Up / Login</strong> (which Chef Claude already includes!) or Sign in with Apple.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            PWA Manifest & Service Worker are active in this build
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
