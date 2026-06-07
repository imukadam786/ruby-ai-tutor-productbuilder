"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Shared app loading state — the ruby progress Lottie (recoloured to #BE1832).
 * Use anywhere a section/screen is loading content. Replaces the old CSS spinners.
 */
export default function RubyLoader({
  size = 96,
  label,
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <DotLottieReact
        src="/lottie/loading.json"
        autoplay
        loop
        style={{ width: size, height: size }}
      />
      {label ? <p className="text-gray-600 font-medium mt-2">{label}</p> : null}
    </div>
  );
}
