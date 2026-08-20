/**
 * Subtle tiled education background pattern, matching the marketing site
 * (rubyaitutor.com) wallpaper — same image asset, tiled the same way.
 * Used on Home, Progress, Settings, and subject session screens.
 */
export default function EduBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        backgroundImage: "url('/images/edu-pattern.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "600px",
        backgroundPosition: "center",
      }}
    />
  );
}
