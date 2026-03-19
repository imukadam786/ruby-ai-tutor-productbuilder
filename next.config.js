const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: { document: "/offline.html" },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // ── Skill tree + question bank JSON (offline lesson content) ──
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/data\/.*\.json$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "lesson-data",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
      // ── App pages (stale-while-revalidate so offline shell works) ──
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      // ── Images / icons ──
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // ── Google Fonts ──
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
