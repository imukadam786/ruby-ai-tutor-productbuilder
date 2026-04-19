"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { VoucherValidateResponse } from "@/app/api/vouchers/validate/route";

const PLANS: {
  key: string;
  label: string;
  priceRands: number;
  color: string;
  features: string[];
}[] = [
  {
    key: "starter",
    label: "Starter",
    priceRands: 149,
    color: "border-blue-400",
    features: ["Maths Engine", "Reading Engine", "Progress Reports", "General Homework Chat"],
  },
  {
    key: "pro",
    label: "Pro",
    priceRands: 299,
    color: "border-purple-400",
    features: ["Everything in Starter", "Unlimited questions", "PDF Reports", "Priority support"],
  },
  {
    key: "ultimate",
    label: "Ultimate",
    priceRands: 499,
    color: "border-amber-400",
    features: ["Everything in Pro", "Multiple learner profiles", "Parent dashboard", "Live tutor sessions"],
  },
];

function formatPrice(rands: number) {
  return `R${rands % 1 === 0 ? rands.toFixed(0) : rands.toFixed(2)} / month`;
}

export default function TrialExpiredScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Voucher state
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<(VoucherValidateResponse & { valid: true; code: string }) | null>(null);

  // Returns the discounted price for a plan if a voucher is applied, else the base price
  function effectivePrice(plan: (typeof PLANS)[number]): number {
    if (!appliedVoucher) return plan.priceRands;
    const applies =
      appliedVoucher.applicable_plans.length === 0 ||
      appliedVoucher.applicable_plans.includes(plan.key);
    if (!applies) return plan.priceRands;
    return appliedVoucher.discounted_price;
  }

  async function applyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    setVoucherLoading(true);
    setVoucherError(null);
    setAppliedVoucher(null);

    // Validate against the first plan that could benefit; the checkout route
    // re-validates server-side per-plan, so this is display-only.
    try {
      const res = await fetch(`/api/vouchers/validate?code=${encodeURIComponent(code)}&plan=starter`);
      const data: VoucherValidateResponse = await res.json();
      if (!data.valid) {
        setVoucherError(data.error);
      } else {
        setAppliedVoucher({ ...data, code });
      }
    } catch {
      setVoucherError("Could not validate voucher. Please try again.");
    } finally {
      setVoucherLoading(false);
    }
  }

  function removeVoucher() {
    setAppliedVoucher(null);
    setVoucherInput("");
    setVoucherError(null);
  }

  const handleChoosePlan = async (plan: string) => {
    setLoading(plan);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Session expired. Please refresh."); return; }

      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan,
          ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
        }),
      });

      if (!res.ok) { setError("Could not start checkout. Please try again."); return; }

      const { url, params } = await res.json();
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      Object.entries(params as Record<string, string>).forEach(([k, v]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="text-4xl">⏰</div>
          <h1 className="text-2xl font-bold text-[#1a2744]">Your free trial has ended</h1>
          <p className="text-gray-500 text-sm">
            Choose a plan to continue learning with Ruby AI Tutor.
          </p>
        </div>

        {/* Voucher input */}
        <div className="space-y-2">
          {appliedVoucher ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Voucher <span className="font-bold">{appliedVoucher.code}</span> applied
                </p>
                <p className="text-xs text-green-600">
                  {appliedVoucher.discount_type === "percentage"
                    ? `${appliedVoucher.discount_value}% off`
                    : `R${appliedVoucher.discount_value} off`}
                  {appliedVoucher.applicable_plans.length > 0
                    ? ` on ${appliedVoucher.applicable_plans.join(", ")}`
                    : " on all plans"}
                </p>
              </div>
              <button
                onClick={removeVoucher}
                className="text-green-500 hover:text-green-700 text-xs underline ml-3"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
                placeholder="Voucher code"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300 bg-gray-50"
              />
              <button
                onClick={applyVoucher}
                disabled={voucherLoading || !voucherInput.trim()}
                className="bg-gray-800 hover:bg-gray-900 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                {voucherLoading ? "…" : "Apply"}
              </button>
            </div>
          )}
          {voucherError && (
            <p className="text-xs text-red-500 px-1">{voucherError}</p>
          )}
        </div>

        {/* Plan cards */}
        <div className="space-y-3">
          {PLANS.map((plan) => {
            const base = plan.priceRands;
            const final = effectivePrice(plan);
            const discounted = final < base;

            return (
              <div key={plan.key} className={`border-2 ${plan.color} rounded-2xl p-4 space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800">{plan.label}</span>
                  <div className="text-right">
                    {discounted && (
                      <span className="text-xs text-gray-400 line-through block">
                        {formatPrice(base)}
                      </span>
                    )}
                    <span className={`text-sm font-semibold ${discounted ? "text-green-600" : "text-gray-600"}`}>
                      {formatPrice(final)}
                    </span>
                  </div>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleChoosePlan(plan.key)}
                  disabled={!!loading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 rounded-xl text-sm font-semibold transition-colors mt-1"
                >
                  {loading === plan.key ? "Redirecting…" : `Choose ${plan.label}`}
                </button>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center">{error}</p>
        )}

        <button
          onClick={handleLogout}
          className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
