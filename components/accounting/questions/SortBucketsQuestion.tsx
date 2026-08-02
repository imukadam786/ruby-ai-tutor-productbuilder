"use client";

// SortBucketsQuestion — drag-and-drop sorting with tap-to-place fallback.
// Uses the same chunky, colour-coded palette as the multiple-choice
// ChoiceGrid/AnswerButton (Concept C) so this question type matches the rest
// of the app instead of the old plain white/gray look. Colour is decorative
// only — it never implies which bucket an item belongs in.

import { useState } from "react";
import type {
  AccountingBucket,
  AccountingSortBucketItem,
} from "@/types/accounting";
import Button from "@/components/ui/Button";
import { ANSWER_COLORS } from "@/lib/design/gemColors";

interface Props {
  buckets: AccountingBucket[];
  items: AccountingSortBucketItem[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

export default function SortBucketsQuestion({ buckets, items, submitting, onSubmit }: Props) {
  // itemId → bucketId. Missing entry means the item is still in the pool.
  const [placement, setPlacement] = useState<Record<string, string>>({});
  const [pickedUp, setPickedUp] = useState<string | null>(null);

  const unplaced = items.filter((it) => !placement[it.id]);

  const placedInBucket = (bucketId: string) =>
    items.filter((it) => placement[it.id] === bucketId);

  const allPlaced = unplaced.length === 0;

  // Stable colour per item (by its position in the original list), so an
  // item's colour doesn't jump around as it moves between pool and bucket.
  const colorForItem = (itemId: string) =>
    ANSWER_COLORS[items.findIndex((it) => it.id === itemId) % ANSWER_COLORS.length];

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
        <div className="flex flex-wrap gap-2 min-h-[60px] bg-gray-50 rounded-2xl border border-gray-200 p-3">
          {unplaced.length === 0 && (
            <p className="text-sm text-gray-400 italic px-2 py-3">All items placed.</p>
          )}
          {unplaced.map((it) => {
            const selected = pickedUp === it.id;
            const c = colorForItem(it.id);
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
                className="min-h-[44px] px-4 py-2 rounded-xl text-left text-sm sm:text-base font-bold text-white transition-transform active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed"
                style={{
                  background: c.bg,
                  boxShadow: selected ? "none" : `0 3px 0 0 ${c.lip}`,
                  transform: selected ? "translateY(3px)" : undefined,
                }}
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
        {buckets.map((b, bi) => {
          const inside = placedInBucket(b.id);
          const c = ANSWER_COLORS[bi % ANSWER_COLORS.length];
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
              className={`rounded-2xl border-2 border-dashed p-3 min-h-[120px] transition-colors ${pickedUp ? "cursor-pointer" : ""}`}
              style={{
                borderColor: pickedUp ? c.bg : `${c.bg}66`,
                background: pickedUp ? `${c.bg}1A` : `${c.bg}0D`,
              }}
            >
              <p className="text-sm font-bold mb-2" style={{ color: c.lip }}>{b.label}</p>
              <div className="flex flex-col gap-2">
                {inside.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Drop items here</p>
                )}
                {inside.map((it) => {
                  const ic = colorForItem(it.id);
                  return (
                    <button
                      key={it.id}
                      disabled={submitting}
                      onClick={(e) => {
                        e.stopPropagation();
                        unplaceItem(it.id);
                      }}
                      className="min-h-[44px] px-3 py-2 rounded-xl text-sm text-white text-left font-bold disabled:cursor-not-allowed"
                      style={{ background: ic.bg }}
                      title="Tap to remove"
                    >
                      {it.text}
                    </button>
                  );
                })}
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
        <Button onClick={submit} disabled={submitting || !allPlaced} size="lg" className="flex-1">
          {allPlaced ? "Check answer" : `Place ${unplaced.length} more`}
        </Button>
      </div>
    </div>
  );
}
