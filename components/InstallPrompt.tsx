"use client";

import { useEffect, useState } from "react";
import { CONCEPT_C } from "@/lib/flags";

// Concept C swaps the old brand red for ruby and gives the CTAs the chunky lip.
const BRAND_BG = CONCEPT_C ? "bg-ruby" : "bg-[#B7182E]";
const CTA = CONCEPT_C
  ? "bg-ruby hover:bg-ruby-deep shadow-lip active:translate-y-[3px] active:shadow-none"
  : "bg-[#B7182E] shadow-md";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | null;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function InstallPrompt({ onDismiss }: { onDismiss: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) { onDismiss(); return; }

    const p = detectPlatform();
    setPlatform(p);

    // Retrieve the globally pre-captured prompt (fired before React loaded)
    const stored = (window as unknown as { __installPrompt?: BeforeInstallPromptEvent }).__installPrompt;
    if (stored) setDeferredPrompt(stored);

    // Also listen in case it fires after mount (rare, but possible on some browsers)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show the prompt after a short delay so the screen has settled
    const t = setTimeout(() => setVisible(true), 800);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, [onDismiss]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        dismiss();
        return;
      }
    }
    dismiss();
  };

  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
    // Remember dismissal so we don't re-show this session
    sessionStorage.setItem("installPromptDismissed", "1");
  };

  if (!visible) return null;

  // iOS — manual "Add to Home Screen" instructions
  if (platform === "ios") {
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-6">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          <div className={`px-5 py-4 flex items-center gap-3 ${BRAND_BG}`}>
            <img src="/icons/icon-192.png" alt="Ruby" className="w-10 h-10 rounded-xl" />
            <div>
              <p className="text-white font-bold text-base leading-tight">Add Ruby to your Home Screen</p>
              <p className="text-white/70 text-xs">Learn anytime, even offline</p>
            </div>
          </div>

          <div className="px-5 py-4 space-y-3">
            <Step n={1} icon="⬆️" text={<>Tap the <strong>Share</strong> button at the bottom of your browser</>} />
            <Step n={2} icon="➕" text={<>Scroll down and tap <strong>Add to Home Screen</strong></>} />
            <Step n={3} icon="💎" text={<>Tap <strong>Add</strong> and Ruby will appear on your home screen</>} />
          </div>

          <div className="px-5 pb-5 space-y-2">
            <button
              onClick={onDismiss}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-base ${CTA}`}
            >
              Got it, I&apos;ll add it now
            </button>
            <button
              onClick={dismiss}
              className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Maybe later
            </button>
          </div>
        </div>
        <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      </div>
    );
  }

  // Android / Desktop — native prompt or manual install button
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "scaleIn 0.25s ease-out" }}
      >
        <div className={`px-5 py-6 text-center ${BRAND_BG}`}>
          <img src="/icons/icon-192.png" alt="Ruby" className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-lg" />
          <h2 className="text-white font-bold text-xl">Install Ruby</h2>
          <p className="text-white/70 text-sm mt-1">Add to your home screen for the best experience</p>
        </div>

        <div className="px-5 py-5 space-y-3">
          <Feature icon="⚡" text="Loads instantly, no browser needed" />
          <Feature icon="📶" text="Lesson content works offline" />
          <Feature icon="📱" text="Full-screen, distraction-free learning" />
        </div>

        <div className="px-5 pb-5 space-y-2">
          <button
            onClick={handleInstall}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-base transition-colors ${
              CONCEPT_C ? CTA : "bg-[#B7182E] shadow-md hover:bg-[#9e1427]"
            }`}
          >
            Install Ruby
          </button>
          <button
            onClick={dismiss}
            className="w-full py-2.5 rounded-xl text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
      <style>{`@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

function Step({ n, icon, text }: { n: number; icon: string; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${BRAND_BG}`}>{n}</div>
      <p className="text-gray-700 text-sm leading-relaxed flex-1">
        <span className="mr-1">{icon}</span>{text}
      </p>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-gray-700 text-sm">{text}</span>
    </div>
  );
}
