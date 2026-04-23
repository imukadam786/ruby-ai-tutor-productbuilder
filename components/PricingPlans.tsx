"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { VoucherValidateResponse } from "@/app/api/vouchers/validate/route";

interface Feature {
  text: string;
  note?: string;
  highlight?: boolean;
}

interface PricingPlan {
  key: string;
  name: string;
  subtitle: string;
  priceRands: number;
  originalPrice: number;
  isLaunchOffer: boolean;
  badge: string | null;
  badgeClass: string;
  selectedRingClass: string;
  idleRingClass: string;
  checkClass: string;
  ctaClass: string;
  isFree: boolean;
  features: Feature[];
}

const PLANS: PricingPlan[] = [
  {
    key: "freebie",
    name: "Freebie",
    subtitle: "Try it out — no card needed",
    priceRands: 0,
    originalPrice: 0,
    isLaunchOffer: false,
    badge: null,
    badgeClass: "",
    selectedRingClass: "ring-2 ring-gray-700 border-gray-700",
    idleRingClass: "border-gray-200",
    checkClass: "bg-gray-700 text-white",
    ctaClass: "bg-gray-800 hover:bg-gray-900 text-white",
    isFree: true,
    features: [
      { text: "CAPS Aligned curriculum" },
      { text: "1× Discovery Activity", note: "Maths or Reading" },
      { text: "1× Discovery Report" },
      { text: "5 Personalised Skills Worksheets" },
      { text: "5 AI Homework Questions per day" },
      { text: "5 hints per day" },
      { text: "Home Language Feedback" },
      { text: "5 Audio Playbacks per day" },
    ],
  },
  {
    key: "scholar",
    name: "Scholar",
    subtitle: "Grade 1 – 11",
    priceRands: 99,
    originalPrice: 149,
    isLaunchOffer: true,
    badge: "Most Popular",
    badgeClass: "bg-rose-600 text-white",
    selectedRingClass: "ring-2 ring-rose-500 border-rose-500",
    idleRingClass: "border-rose-300",
    checkClass: "bg-rose-600 text-white",
    ctaClass: "bg-rose-600 hover:bg-rose-700 text-white",
    isFree: false,
    features: [
      { text: "CAPS Aligned curriculum" },
      { text: "2× Discovery Activities", note: "Maths & Reading" },
      { text: "2× Discovery Reports" },
      { text: "Full Personalised Skills Worksheets" },
      { text: "Unlimited AI Homework Assist" },
      { text: "Unlimited hints" },
      { text: "Home Language Feedback" },
      { text: "Unlimited Audio Playback" },
    ],
  },
  {
    key: "master",
    name: "Master",
    subtitle: "Grade 12",
    priceRands: 129,
    originalPrice: 199,
    isLaunchOffer: true,
    badge: "Grade 12 Edition",
    badgeClass: "bg-amber-500 text-white",
    selectedRingClass: "ring-2 ring-amber-500 border-amber-500",
    idleRingClass: "border-amber-300",
    checkClass: "bg-amber-500 text-white",
    ctaClass: "bg-amber-500 hover:bg-amber-600 text-white",
    isFree: false,
    features: [
      { text: "Everything in Scholar" },
      { text: "50+ Matric Past Papers", note: "Practice & Guide Mode", highlight: true },
      { text: "9 Matric Study Guides", note: "Major Subjects", highlight: true },
      { text: "10+ Matric 2026 Prep Papers", note: "Major Subjects", highlight: true },
    ],
  },
];

interface PricingPlansProps {
  onSelectFree?: () => void;
  showHeader?: boolean;
  mode?: "onboarding" | "upgrade";
}

export default function PricingPlans({ onSelectFree, showHeader = true, mode = "onboarding" }: PricingPlansProps) {
  const [selected, setSelected] = useState<string | null>(mode === "onboarding" ? "freebie" : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<
    (VoucherValidateResponse & { valid: true; code: string }) | null
  >(null);

  const visiblePlans = mode === "upgrade" ? PLANS.filter((p) => !p.isFree) : PLANS;
  const selectedPlan = visiblePlans.find((p) => p.key === selected) ?? null;

  function effectivePrice(plan: PricingPlan): number {
    if (plan.isFree) return 0;
    const base = plan.priceRands;
    if (!appliedVoucher) return base;
    const applies =
      appliedVoucher.applicable_plans.length === 0 ||
      appliedVoucher.applicable_plans.includes(plan.key);
    if (!applies) return base;
    const dv = appliedVoucher.discount_value;
    const discounted =
      appliedVoucher.discount_type === "percentage"
        ? base * (1 - dv / 100)
        : base - dv;
    return Math.max(0, Math.round(discounted * 100) / 100);
  }

  async function applyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    setVoucherLoading(true);
    setVoucherError(null);
    setAppliedVoucher(null);
    try {
      const res = await fetch(`/api/vouchers/validate?code=${encodeURIComponent(code)}&plan=scholar`);
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

  async function handleContinue() {
    if (!selectedPlan) return;
    if (selectedPlan.isFree) {
      onSelectFree?.();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Session expired. Please refresh."); return; }
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ plan: selectedPlan.key, ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}) }),
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
      setLoading(false);
    }
  }

  function ctaLabel(): string {
    if (!selectedPlan) return "Select a plan to continue";
    if (selectedPlan.isFree) return "Continue with Freebie — it's free";
    const price = effectivePrice(selectedPlan);
    return loading ? "Redirecting to payment…" : `Continue with ${selectedPlan.name} — R${price}/mo`;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {showHeader && (
        <div className="text-center mb-10 space-y-2">
          <p className="text-xs font-semibold tracking-widest text-rose-500 uppercase">
            CAPS Aligned · South African Curriculum
          </p>
          <h1 className="text-3xl font-extrabold text-[#1a2744]">Choose your learning plan</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Personalised tutoring that adapts to your child&apos;s pace — in any SA home language.
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className={`grid grid-cols-1 gap-4 md:gap-5 ${mode === "upgrade" ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {visiblePlans.map((plan) => {
          const isSelected = selected === plan.key;
          const final = effectivePrice(plan);
          const voucherApplied = !plan.isFree && appliedVoucher && final < plan.priceRands;

          return (
            <div
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`relative border-2 rounded-2xl bg-white flex flex-col cursor-pointer transition-all duration-150 select-none
                ${isSelected ? plan.selectedRingClass + " shadow-lg" : plan.idleRingClass + " opacity-70 hover:opacity-100 hover:shadow-md"}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${plan.badgeClass}`}>
                  {plan.badge}
                </div>
              )}

              {/* Selected checkmark */}
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${plan.checkClass}`}>
                  ✓
                </div>
              )}

              <div className="p-6 flex flex-col flex-1 gap-4">
                {/* Name + subtitle */}
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a2744]">{plan.name}</h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="space-y-0.5">
                  {plan.isFree ? (
                    <p className="text-3xl font-extrabold text-gray-700">Free</p>
                  ) : (
                    <>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-[#1a2744]">
                          R{voucherApplied ? final : plan.priceRands}
                          <span className="text-base font-semibold text-gray-400">/mo</span>
                        </span>
                        {(plan.isLaunchOffer || voucherApplied) && (
                          <span className="text-sm text-gray-400 line-through mb-1">
                            R{voucherApplied ? plan.priceRands : plan.originalPrice}
                          </span>
                        )}
                      </div>
                      {plan.isLaunchOffer && !voucherApplied && (
                        <span className="inline-block text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                          Launch Offer — Save R{plan.originalPrice - plan.priceRands}/mo
                        </span>
                      )}
                      {voucherApplied && (
                        <span className="inline-block text-xs font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                          Voucher applied
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 flex-shrink-0 font-bold ${f.highlight ? "text-amber-500" : "text-green-500"}`}>✓</span>
                      <span>
                        <span className={f.highlight ? "font-semibold text-gray-800" : "text-gray-700"}>{f.text}</span>
                        {f.note && <span className="text-gray-400 text-xs ml-1">({f.note})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voucher */}
      <div className="mt-6 max-w-sm mx-auto space-y-2">
        {appliedVoucher ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-green-700">Voucher <span className="font-bold">{appliedVoucher.code}</span> applied</p>
              <p className="text-xs text-green-600">
                {appliedVoucher.discount_type === "percentage" ? `${appliedVoucher.discount_value}% off` : `R${appliedVoucher.discount_value} off`}
                {appliedVoucher.applicable_plans.length > 0 ? ` on ${appliedVoucher.applicable_plans.join(", ")}` : " on paid plans"}
              </p>
            </div>
            <button onClick={removeVoucher} className="text-green-500 hover:text-green-700 text-xs underline ml-3">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
              placeholder="Have a voucher code?"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 placeholder-gray-300 bg-gray-50"
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
        {voucherError && <p className="text-xs text-red-500 px-1">{voucherError}</p>}
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center mt-4">{error}</p>}

      {/* Single Continue button */}
      <div className="mt-6">
        <button
          onClick={handleContinue}
          disabled={!selectedPlan || loading}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed
            ${selectedPlan ? selectedPlan.ctaClass : "bg-gray-200 text-gray-400"}`}
        >
          {ctaLabel()}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        All plans include CAPS-aligned content · Cancel anytime · Secure payment via PayFast
      </p>
    </div>
  );
}
