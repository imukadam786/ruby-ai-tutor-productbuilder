"use client";

// SortBucketsQuestion — drag-and-drop sorting with tap-to-place fallback.
//
// UX:
//   • Each item is a draggable card. Tap once to "pick up", tap a bucket to
//     drop it there. This is the phone-friendly mode (no drag required).
//   • Desktop users can drag the card onto a bucket the usual way.
//   • A small "Reset" link clears all placements. Submit enables once every
//     item has been placed.

import { useMemo, useState } from "react";
import type {
  EconomicsBucket,
  EconomicsSortBucketItem,
} from "@/types/economics";

interface Props {
  buckets: EconomicsBucket[];
  items: EconomicsSortBucketItem[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

export default function SortBucketsQuestion({ buckets, items, submitting, onSubmit }: Props) {
  // itemId → bucketId. Missing entry means the item is still in the pool.
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [pickedUp, setPickedUp] = useState<string | null>(null);

  const unplaced = useMemo(
    () => items.filter((it) => !placement[it.id]),
    [items, placement],
  );

  const placedInBucket = (bucketId: string) =>
    items.filter((it) => placement[it.id] === bucketId);

  const allPlaced = unplaced.length === 0;

  function placeItem(itemId: string, bucketId: string) {
    setPlacement((prev) => ({ ...prev, [itemId]: bucketId }));
    setPickedUp(null);
  }

  function unplaceItem(itemId: string) {
    setPlacement((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    setPickedUp(null);
  }

  function reset() {
    setPlacement({});
    setPickedUp(null);
  }

  function submit() {
    onSubmit(JSON.stringify(placement));
  }

  return (
    <div className="space-y-4">
      {/* Item pool — tap to pick up, or drag to a bucket */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          {pickedUp ? "Now tap a bucket below" : "Tap an item to pick it up, then tap a bucket"}
        </p>
        <div className="flex flex-wrap gap-2 min-h-[60px] bg-white rounded-2xl border border-gray-200 p-3">
          {unplaced.length === 0 && (
            <p className="text-sm text-gray-400 italic px-2 py-3">All items placed.</p>
          )}
          {unplaced.map((it) => {
            const selected = pickedUp === it.id;
            return (
              <button
                key={it.id}
                disabled={submitting}
                draggable={!submitting}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", it.id);
                  setPickedUp(it.id);
                }}
                onClick={() => setPickedUp(selected ? null : it.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl border-2 text-left text-sm sm:text-base font-medium transition-all ${
                  selected
                    ? "bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-300"
                    : "bg-white border-gray-300 text-[#1a2744] hover:border-amber-300"
                }`}
              >
                {it.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Buckets */}
      <div
        className={`grid gap-3 ${
          buckets.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-" + buckets.length
        }`}
      >
        {buckets.map((b) => {
          const inside = placedInBucket(b.id);
          return (
            <div
              key={b.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) placeItem(id, b.id);
              }}
              onClick={() => {
                if (pickedUp) placeItem(pickedUp, b.id);
              }}
              className={`rounded-2xl border-2 border-dashed p-3 min-h-[120px] transition-colors ${
                pickedUp
                  ? "border-amber-400 bg-amber-50/70 cursor-pointer"
                  : "border-gray-300 bg-white"
              }`}
            >
              <p className="text-sm font-bold text-[#1a2744] mb-2">{b.label}</p>
              <div className="flex flex-col gap-2">
                {inside.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Drop items here</p>
                )}
                {inside.map((it) => (
                  <button
                    key={it.id}
                    disabled={submitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      unplaceItem(it.id);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-100 border border-amber-300 text-sm text-amber-900 text-left hover:bg-amber-200"
                    title="Tap to remove"
                  >
                    {it.text}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={reset}
          disabled={submitting || Object.keys(placement).length === 0}
          className="text-sm text-gray-500 hover:text-brand disabled:text-gray-300 underline underline-offset-4"
        >
          Reset
        </button>
        <button
          onClick={submit}
          disabled={submitting || !allPlaced}
          className="flex-1 py-4 rounded-full bg-brand hover:bg-brand-hover disabled:bg-gray-300 text-white font-bold text-base"
        >
          {allPlaced ? "Check answer" : `Place ${unplaced.length} more`}
        </button>
      </div>
    </div>
  );
}
