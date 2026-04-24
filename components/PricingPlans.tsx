"use client";

import { useState, useRef } from "react";
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
  borderClass: string;
  ctaClass: string;
  ctaLabel: string;
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
    borderClass: "border-gray-200",
    ctaClass: "bg-gray-800 hover:bg-gray-900 text-white",
    ctaLabel: "Get Started",
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
    borderClass: "border-rose-400",
    ctaClass: "bg-rose-600 hover:bg-rose-700 text-white",
    ctaLabel: "Go Premium",
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
    borderClass: "border-amber-400",
    ctaClass: "bg-amber-500 hover:bg-amber-600 text-white",
    ctaLabel: "Access Everything",
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

export default function PricingPlans({
  onSelectFree,
  showHeader = true,
  mode = "onboarding",
}: PricingPlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<
    (VoucherValidateResponse & { valid: true; code: string }) | null
  >(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const visiblePlans = mode === "upgrade" ? PLANS.filter((p) => !p.isFree) : PLANS;

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
      const res = await fetch(
        `/api/vouchers/validate?code=${encodeURIComponent(code)}&plan=scholar`
      );
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

  async function handlePlanCTA(plan: PricingPlan) {
    if (plan.isFree) {
      onSelectFree?.();
      return;
    }
    setLoadingPlan(plan.key);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError("Session expired. Please refresh.");
        return;
      }
      const res = await fetch("/api/payfast/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          plan: plan.key,
          ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
        }),
      });
      if (!res.ok) {
        setError("Could not start checkout. Please try again.");
        return;
      }
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
      setLoadingPlan(null);
    }
  }

  function scrollToCard(index: number) {
    const container = carouselRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement | undefined;
    if (card) {
      container.scrollTo({
        left: card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {showHeader && (
        <div className="text-center mb-8 space-y-2">
          <p className="text-xs font-semibold tracking-widest text-rose-500 uppercase">
            CAPS Aligned · South African Curriculum
          </p>
          <h1 className="text-3xl font-extrabold text-[#1a2744]">Choose your learning plan</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Personalised tutoring that adapts to your child&apos;s pace — in any SA home language.
          </p>
        </div>
      )}

      {/* Voucher — top */}
      <div className="max-w-sm mx-auto mb-6 space-y-2">
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
                  : " on paid plans"}
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

      {/* Plan cards — carousel on mobile, grid on desktop */}
      <div
        ref={carouselRef}
        className={`
          flex md:grid gap-4 md:gap-5
          overflow-x-auto md:overflow-visible
          snap-x snap-mandatory md:snap-none
          scrollbar-hide pb-2 md:pb-0
          pt-5 md:pt-0
          md:items-stretch
          ${mode === "upgrade" ? "md:grid-cols-2" : "md:grid-cols-3"}
        `}
      >
        {visiblePlans.map((plan, index) => {
          const final = effectivePrice(plan);
          const voucherApplied = !plan.isFree && !!appliedVoucher && final < plan.priceRands;
          const isLoading = loadingPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={`
                relative border-2 rounded-2xl bg-white flex flex-col
                flex-shrink-0 w-[78vw] md:w-auto snap-center
                ${plan.borderClass}
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${plan.badgeClass}`}
                >
                  {plan.badge}
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
                      <span
                        className={`mt-0.5 flex-shrink-0 font-bold ${
                          f.highlight ? "text-amber-500" : "text-green-500"
                        }`}
                      >
                        ✓
                      </span>
                      <span>
                        <span
                          className={
                            f.highlight ? "font-semibold text-gray-800" : "text-gray-700"
                          }
                        >
                          {f.text}
                        </span>
                        {f.note && (
                          <span className="text-gray-400 text-xs ml-1">({f.note})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Per-plan CTA — centred at bottom of card */}
                <button
                  onClick={() => { scrollToCard(index); handlePlanCTA(plan); }}
                  disabled={!!loadingPlan}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 mt-2 ${plan.ctaClass}`}
                >
                  {isLoading ? "Redirecting…" : plan.ctaLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel dots — mobile only */}
      <div className="flex md:hidden justify-center gap-2 mt-4">
        {visiblePlans.map((plan, i) => (
          <button
            key={plan.key}
            onClick={() => scrollToCard(i)}
            className="h-2 w-2 rounded-full bg-gray-300 hover:bg-rose-400 transition-colors"
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center mt-4">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        All plans include CAPS-aligned content · Cancel anytime · Secure payment via PayFast
      </p>
    </div>
  );
}
