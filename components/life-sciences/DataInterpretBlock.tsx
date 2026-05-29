"use client";

import type { LifeSciencesDataBlock } from "@/types/life-sciences";

/**
 * Renders the inline `data` block on data-interpret items. Fall-through order
 * matches the data shape: image → table → calculation → description →
 * chart_type label fallback. Image lives at /life-sciences/<key>.png|svg.
 * When the file is missing the broken-image alt label is the chart_type label.
 */
export function DataInterpretBlock({ data }: { data: LifeSciencesDataBlock | undefined }) {
  if (!data) return null;

  const showImage = !!data.image_ref;
  const showTable = Array.isArray(data.table) && data.table.length > 0;
  const showCalc = !!data.calculation;
  const showDescription = !!data.description;
  const showChartFallback = !!data.chart_type && !showImage;

  if (!showImage && !showTable && !showCalc && !showDescription && !showChartFallback) {
    return null;
  }

  return (
    <div className="my-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-950">
      {showImage && (
        <div className="mb-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/life-sciences/${data.image_ref}.png`}
            alt={data.chart_type ?? data.description ?? "Diagram"}
            className="max-h-72 rounded"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (el.src.endsWith(".png")) {
                el.src = `/life-sciences/${data.image_ref}.svg`;
                return;
              }
              el.style.display = "none";
            }}
          />
        </div>
      )}

      {showTable && (
        <table className="mb-3 w-full border-collapse text-left">
          <thead>
            <tr>
              {(data.table![0] as Array<string | number>).map((h, i) => (
                <th
                  key={i}
                  className="border-b border-emerald-300 px-2 py-1 font-semibold"
                >
                  {String(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.table!.slice(1).map((row, ri) => (
              <tr key={ri}>
                {(row as Array<string | number>).map((cell, ci) => (
                  <td
                    key={ci}
                    className="border-b border-emerald-200 px-2 py-1"
                  >
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showCalc && (
        <pre className="mb-3 overflow-x-auto rounded bg-white/70 p-3 font-mono text-sm">
          {data.calculation}
        </pre>
      )}

      {showDescription && (
        <p className="mb-1 italic text-emerald-900">{data.description}</p>
      )}

      {showChartFallback && (
        <p className="mt-1 text-xs text-emerald-700">Chart: {data.chart_type}</p>
      )}
    </div>
  );
}
