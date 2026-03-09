"use client";

import { useState, useEffect } from "react";

// 🌍 Africa/Europe → 🌎 Americas → 🌏 Asia/Australia → repeat
// Matches real Earth west→east rotation as seen from space
const FACES = ["🌍", "🌎", "🌏"];

export default function SpinningGlobe() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % 3), 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="text-6xl transition-all duration-300"
      style={{ display: "inline-block" }}
    >
      {FACES[idx]}
    </div>
  );
}
