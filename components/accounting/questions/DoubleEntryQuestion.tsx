"use client";

// DoubleEntryQuestion — tap which account is debited and which is credited.
//
// Tap-only: the learner taps a slot (Debit / Credit) to make it active, then
// taps an account from the shared pool to fill it. Tapping a filled slot clears
// it. Submit enables once both slots are filled. Payload: { debit, credit }.

import { useState } from "react";
import type { AccountingLedgerAccount } from "@/types/accounting";

interface Props {
  accounts: AccountingLedgerAccount[];
  submitting: boolean;
  onSubmit: (payload: string) => void;
}

type Slot = "debit" | "credit";

export default function DoubleEntryQuestion({ accounts, submitting, onSubmit }: Props) {
  const [debit, setDebit] = useState<string | null>(null);
  const [credit, setCredit] = useState<string | null>(null);
  const [active, setActive] = useState<Slot>("debit");

  const labelFor = (id: string | null) =>
    id ? accounts.find((a) => a.id === id)?.label ?? id : null;

  function assign(accountId: string) {
    if (active === "debit") {
      setDebit(accountId);
      setActive("credit");
    } else {
      setCredit(accountId);
    }
  }

  function clearSlot(slot: Slot) {
    if (slot === "debit") setDebit(null);
    else setCredit(null);
    setActive(slot);
  }

  const ready = debit !== null && credit !== null;

  function submit() {
    onSubmit(JSON.stringify({ debit, credit }));
  }

  const slotClass = (slot: Slot, filled: boolean) =>
    `flex-1 rounded-2xl border-2 px-4 py-4 text-left transition-all ${
      active === slot && !filled
        ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300"
        : filled
        ? "border-emerald-300 bg-emerald-50"
        : "border-dashed border-gray-300 bg-white"
    }`;

  return (
    <div className="space-y-4">
      {/* Debit / Credit slots */}
      <div className="flex gap-3">
        {(["debit", "credit"] as Slot[]).map((slot) => {
          const id = slot === "debit" ? debit : credit;
          const filled = id !== null;
          return (
            <button
              key={slot}
              type="button"
              disabled={submitting}
              onClick={() => (filled ? clearSlot(slot) : setActive(slot))}
              className={slotClass(slot, filled)}
              title={filled ? "Tap to clear" : undefined}
            >
              <span className="block text-xs font-bold uppercase tracking-wide text-gray-500">
                {slot === "debit" ? "Debit" : "Credit"}
              </span>
              <span className={`block text-base font-semibold ${filled ? "text-[#1a2744]" : "text-gray-400 italic"}`}>
                {filled ? labelFor(id) : "Tap an account below"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {active === "debit" ? "Pick the account to debit" : "Pick the account to credit"}
      </p>

      {/* Account pool */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {accounts.map((a) => {
          const used = a.id === debit || a.id === credit;
          return (
            <button
              key={a.id}
              disabled={submitting || used}
              onClick={() => assign(a.id)}
              className={`min-h-[48px] rounded-xl border-2 px-4 py-2 text-left text-sm sm:text-base font-medium transition-all active:scale-95 ${
                used
                  ? "bg-gray-100 border-gray-200 text-gray-400"
                  : "bg-white border-gray-300 text-[#1a2744] hover:border-emerald-300"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={submit}
        disabled={submitting || !ready}
        className="w-full py-4 rounded-full bg-[#BE1832] hover:bg-[#a01528] disabled:bg-gray-300 text-white font-bold text-base"
      >
        {ready ? "Check answer" : "Fill both Debit and Credit"}
      </button>
    </div>
  );
}
