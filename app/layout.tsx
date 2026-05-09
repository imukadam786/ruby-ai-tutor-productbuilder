import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: "Ruby AI Tutor",
  description: "Your personal AI tutor for Maths and Reading",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ruby",
    startupImage: "/icons/apple-touch-icon.png",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#B7182E",
  // Prevents layout from resizing when soft keyboard opens on mobile
  interactiveWidget: "resizes-visual",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ruby" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Capture beforeinstallprompt before React loads — Android Chrome fires
            this early in page lifecycle, before any component can listen for it */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.__installPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__installPrompt = e;
          });
        `}} />
      </head>
      <body className="h-full overflow-hidden antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
