"use client";

// SourceBlock — optional source rendered ABOVE any Tourism mechanic.
// Supports text passages, images, maps and cartoons. Provenance badge sits
// underneath. Long text scrolls independently so the mechanic below stays
// visible on a phone-sized viewport.

import { useState } from "react";
import type { TourismProvenance, TourismSource } from "@/types/tourism";

const HIS_IMAGE_EXTS = ["png", "svg", "jpg", "jpeg", "webp"];

function ProvenanceBadge({ provenance }: { provenance?: TourismProvenance }) {
  if (!provenance) return null;
  const parts = [
    provenance.author,
    provenance.date,
    provenance.origin,
  ].filter((p): p is string => !!p && p.length > 0);
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {provenance.type && (
        <span
          className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${
            provenance.type === "primary"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {provenance.type === "primary" ? "Primary source" : "Secondary source"}
        </span>
      )}
      {parts.length > 0 && (
        <span className="text-xs text-gray-500 italic">{parts.join(" · ")}</span>
      )}
    </div>
  );
}

function SourceImage({ imageKey, alt }: { imageKey: string; alt: string }) {
  const [extIdx, setExtIdx] = useState(0);
  if (extIdx >= HIS_IMAGE_EXTS.length) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center text-sm italic text-amber-700">
        Source image described in the caption.
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/tourism/${imageKey}.${HIS_IMAGE_EXTS[extIdx]}`}
        alt={alt}
        onError={() => setExtIdx((i) => i + 1)}
        className="max-h-72 w-auto rounded-2xl border border-amber-200 bg-white"
      />
    </div>
  );
}

export default function SourceBlock({ source }: { source: TourismSource }) {
  const altText = source.caption ?? "Historical source";
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      {source.type === "text" ? (
        <div className="max-h-64 overflow-y-auto pr-1 text-sm sm:text-base leading-relaxed text-[#1a2744] whitespace-pre-line">
          {source.content}
        </div>
      ) : (
        <SourceImage imageKey={source.content} alt={altText} />
      )}
      {source.caption && (
        <p className="mt-2 text-xs text-gray-600 italic">{source.caption}</p>
      )}
      <ProvenanceBadge provenance={source.provenance} />
    </div>
  );
}
