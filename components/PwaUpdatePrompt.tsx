"use client";

import { useEffect, useState } from "react";

/**
 * Shows a small "new version is ready" banner when a freshly deployed service
 * worker takes over, so installed PWA users aren't stuck on stale code.
 *
 * The app's service worker activates new versions immediately (skipWaiting),
 * which fires `controllerchange`. At that point the code already on screen is
 * the old build, so we invite the user to reload to pick up the new one. We
 * also poll for updates on load, on tab focus, and hourly so the prompt appears
 * without needing a full restart.
 */
export default function PwaUpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Whether this page load is already controlled by a service worker. On a
    // brand-new install the first activation also fires controllerchange — we
    // must NOT treat that as an "update", only later takeovers.
    const hadController = !!navigator.serviceWorker.controller;

    const onControllerChange = () => {
      if (hadController) setUpdateReady(true);
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    let cleanupChecks = () => {};
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      const check = () => { reg.update().catch(() => {}); };
      check(); // check once on load
      const onVisible = () => { if (document.visibilityState === "visible") check(); };
      document.addEventListener("visibilitychange", onVisible);
      const interval = window.setInterval(check, 60 * 60 * 1000); // hourly
      cleanupChecks = () => {
        document.removeEventListener("visibilitychange", onVisible);
        window.clearInterval(interval);
      };
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      cleanupChecks();
    };
  }, []);

  if (!updateReady) return null;

  return (
    <div className="fixed z-[9998] left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 w-[calc(100%-2rem)] max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl bg-gray-900 text-white px-4 py-3 shadow-xl">
        <span className="text-xl flex-shrink-0">🔄</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">A new version is ready</p>
          <p className="text-gray-300 text-xs leading-tight mt-0.5">Refresh to get the latest Ruby.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex-shrink-0 bg-[#BE1832] hover:bg-[#a3142a] text-white text-sm font-semibold px-3.5 py-1.5 rounded-xl transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
