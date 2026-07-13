"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PREFETCH_REGISTRY, OFFLINE_CAPABLE_SUBJECTS } from "./prefetch-registry";

// Pre-caches a learner's own subjects for offline use: warms each subject's
// code chunk (carries the question text) and caches its diagrams from
// public/offline-manifest.json. The service-worker rules in next.config.js do
// the actual storing — here we just trigger the fetches and track progress.
//
// Policy: on a connection we can confirm is un-metered (wifi/ethernet, or 4g
// without Data Saver), download silently. When we cannot tell — every iPhone,
// since Safari hides connection info — or the connection looks metered, we do
// NOT auto-pull; the card badge becomes a tap-to-save affordance instead, so a
// learner on mobile data is never charged by surprise.

export type OfflineStatus = "idle" | "downloading" | "ready" | "error";

interface ManifestImage {
  url: string;
  bytes: number;
}
interface ManifestSubject {
  imageCount: number;
  totalBytes: number;
  images: ManifestImage[];
}
interface Manifest {
  version: string;
  subjects: Record<string, ManifestSubject>;
}

interface NetworkInformation {
  saveData?: boolean;
  type?: string;
  effectiveType?: string;
}

const LS_KEY = "ruby_offline_downloaded_v1";

function readDownloaded(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function markDownloaded(id: string, version: string) {
  if (typeof window === "undefined") return;
  try {
    const cur = readDownloaded();
    cur[id] = version;
    window.localStorage.setItem(LS_KEY, JSON.stringify(cur));
  } catch {
    /* storage full or blocked — badge will just re-offer the download */
  }
}

/** True only when we are confident the connection is not metered. */
function connectionIsUnmetered(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (!c) return false; // iOS Safari and others: unknown → never auto-download
  if (c.saveData) return false; // user asked to save data — respect it
  if (c.type) return c.type === "wifi" || c.type === "ethernet";
  return c.effectiveType === "4g"; // best signal Android Chrome gives when type is absent
}

/** Ask the OS to keep our cache from being evicted. Best-effort, once. */
async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    /* not supported — fine */
  }
}

export function useOfflineDownload(subjectIds: string[]) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [status, setStatus] = useState<Record<string, OfflineStatus>>({});
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const autoRunRef = useRef(false);

  // Load the manifest once.
  useEffect(() => {
    let cancelled = false;
    fetch("/offline-manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((m: Manifest | null) => {
        if (!cancelled && m) setManifest(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Only subjects whose practice actually works offline are downloadable.
  const eligibleIds = manifest
    ? subjectIds.filter((id) => OFFLINE_CAPABLE_SUBJECTS.has(id))
    : [];

  // Seed status from what's already recorded as downloaded at this version.
  useEffect(() => {
    if (!manifest) return;
    const done = readDownloaded();
    setStatus((prev) => {
      const next = { ...prev };
      for (const id of eligibleIds) {
        if (next[id] === "downloading") continue;
        next[id] = done[id] === manifest.version ? "ready" : "idle";
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, eligibleIds.join(",")]);

  const download = useCallback(
    (id: string) => {
      if (!manifest) return;
      // Serialise downloads so background warming stays gentle.
      queueRef.current = queueRef.current.then(async () => {
        setStatus((s) => (s[id] === "ready" ? s : { ...s, [id]: "downloading" }));
        await requestPersistentStorage();
        try {
          // 1) Warm the subject's code chunk(s) — pulls in question text + tree.
          const thunks = PREFETCH_REGISTRY[id] || [];
          await Promise.allSettled(thunks.map((t) => t()));
          // 2) Cache its diagrams. The SW's CacheFirst route stores each fetch.
          const images = manifest.subjects[id]?.images || [];
          await Promise.allSettled(images.map((img) => fetch(img.url)));
          markDownloaded(id, manifest.version);
          setStatus((s) => ({ ...s, [id]: "ready" }));
        } catch {
          setStatus((s) => ({ ...s, [id]: "error" }));
        }
      });
    },
    [manifest],
  );

  // Auto-download (once) when the connection is confirmed un-metered.
  useEffect(() => {
    if (!manifest || autoRunRef.current) return;
    if (!connectionIsUnmetered()) return;
    autoRunRef.current = true;
    const done = readDownloaded();
    for (const id of eligibleIds) {
      if (done[id] !== manifest.version) download(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifest, eligibleIds.join(","), download]);

  const isEligible = useCallback((id: string) => eligibleIds.includes(id), [eligibleIds]);

  return { status, download, isEligible };
}
