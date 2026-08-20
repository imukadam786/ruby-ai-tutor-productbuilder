"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CONCEPT_C } from "@/lib/flags";
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
  isFree?: boolean;
  badge: string | null;
  badgeClass: string;
  borderClass: string;
  ctaClass: string;
  ctaLabel: string;
  paymentType: "subscription" | "once-off";
  savingsLabel?: string;
  features: Feature[];
}

const WEEKLY_PRICES: Record<string, number> = {
  scholar: 29,
  master:  39,
};

const PLANS: PricingPlan[] = [
  {
    key: "matric-pack",
    name: "Matric Exam Pack",
    subtitle: "Grade 12",
    priceRands: 199,
    originalPrice: 299,
    isLaunchOffer: true,
    badge: "New",
    badgeClass: "bg-blue-500 text-white",
    borderClass: "border-blue-400",
    ctaClass: "bg-blue-500 hover:bg-blue-600 text-white",
    ctaLabel: "Own It",

    paymentType: "once-off",
    savingsLabel: "Launch Offer — Save R99",
    features: [
      { text: "50+ Matric Past Papers", note: "Practice & Guide Mode", highlight: true },
      { text: "10+ Matric Study Guides", note: "Major Subjects", highlight: true },
      { text: "15+ Matric 2026 Prep Papers", note: "Major Subjects", highlight: true },
      { text: "Unlimited AI Feedback in 11 Languages" },
      { text: "Unlimited Access between 1 August – 30 November 2026" },
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

    paymentType: "subscription",
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
    key: "freebie",
    name: "Freebie",
    subtitle: "Try it out — no card needed",
    priceRands: 0,
    originalPrice: 0,
    isLaunchOffer: false,
    isFree: true,
    // Dark border + top badge so Free reads as an active choice, not a
    // switched-off card (matches the bordered + badged paid tiles).
    badge: "No Card Needed",
    badgeClass: "bg-[#1a2744] text-white",
    borderClass: "border-[#1a2744]",
    ctaClass: "bg-gray-100 hover:bg-gray-200 text-gray-700",
    ctaLabel: "Get Started",
    paymentType: "subscription",
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
  /*{
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

    paymentType: "subscription",
    features: [
      { text: "Everything in Scholar" },
      { text: "50+ Matric Past Papers", note: "Practice & Guide Mode", highlight: true },
      { text: "9 Matric Study Guides", note: "Major Subjects", highlight: true },
      { text: "10+ Matric 2026 Prep Papers", note: "Major Subjects", highlight: true },
    ],
  },*/
];

interface PricingPlansProps {
  showHeader?: boolean;
  mode?: "onboarding" | "upgrade" | "matric";
  onSelectFree?: () => void;
}

export default function PricingPlans({
  showHeader = true,
  mode = "onboarding",
  onSelectFree,
}: PricingPlansProps) {
  // Defaults to weekly: the smaller per-week price is easier for parents to
  // commit to on first view; they can switch to Monthly with the toggle.
  const [billingCycle, setBillingCycle] = useState<"monthly" | "weekly">("weekly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<
    (VoucherValidateResponse & { valid: true; code: string }) | null
  >(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  const visiblePlans =
    mode === "matric" ? PLANS.filter((p) => p.key === "matric-pack" || p.key === "master") :
    mode === "upgrade" ? PLANS.filter((p) => !p.isFree) :
    PLANS;

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;
    const handleScroll = () => {
      const children = Array.from(container.children) as HTMLElement[];
      const containerCenter = container.scrollLeft + container.offsetWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      children.forEach((child, i) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(childCenter - containerCenter);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActiveCard(closest);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  function basePrice(plan: PricingPlan): number {
    if (plan.paymentType === "subscription" && billingCycle === "weekly" && WEEKLY_PRICES[plan.key] != null)
      return WEEKLY_PRICES[plan.key];
    return plan.priceRands;
  }

  function effectivePrice(plan: PricingPlan): number {
    const base = basePrice(plan);
    if (!appliedVoucher) return base;
    const applies =
      appliedVoucher.applicable_plans.length === 0 ||
      appliedVoucher.applicable_plans.includes(plan.key);
    if (!applies) return base;
    const dv = appliedVoucher.discount_value ?? 0;
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
        `/api/vouchers/validate?code=${encodeURIComponent(code)}`
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

      const finalPrice = effectivePrice(plan);

      if (finalPrice === 0) {
        // Zero-cost (voucher covers full amount) — activate directly, skip PayFast
        const res = await fetch("/api/plans/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            plan: plan.key,
            paymentType: plan.paymentType,
            ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
          }),
        });
        if (!res.ok) {
          setError("Could not activate plan. Please try again.");
          return;
        }
        window.location.href = "/?payment=success";
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
          paymentType: plan.paymentType,
          billingFrequency: billingCycle,
          ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
          ...(billingCycle === "weekly" && WEEKLY_PRICES[plan.key] != null
            ? { amountOverride: WEEKLY_PRICES[plan.key].toFixed(2) }
            : {}),
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
    <div className="w-full max-w-4xl mx-auto pt-5 pb-4">
      {showHeader && (
        <div className="text-center mb-4 px-4">
          <h1 className="text-2xl font-extrabold text-[#1a2744]">Choose your learning plan</h1>
        </div>
      )}

      {/* Billing cycle toggle — prominent. Active option is rose-600 + white;
          inactive is white + black so both sides read clearly on the card. */}
      <div className="flex justify-center mb-5">
        <div
          role="tablist"
          aria-label="Billing cycle"
          className="inline-flex rounded-2xl border-2 border-gray-200 bg-white p-1 gap-1 shadow-sm"
        >
          {(["monthly", "weekly"] as const).map((cycle) => {
            const isActive = billingCycle === cycle;
            return (
              <button
                key={cycle}
                role="tab"
                aria-selected={isActive}
                onClick={() => setBillingCycle(cycle)}
                className={`px-8 py-3 rounded-xl text-base font-bold transition-colors ${
                  isActive
                    ? "bg-rose-600 text-white shadow"
                    : "bg-white text-black hover:bg-gray-50"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Weekly"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voucher — top */}
      <div className="max-w-sm mx-auto mb-4 space-y-2 px-4">
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

      {/* Plan cards — full-width carousel on mobile, grid on desktop */}
      <div
        ref={carouselRef}
        className={`
          flex md:grid gap-0 md:gap-5
          overflow-x-auto md:overflow-visible
          snap-x snap-mandatory md:snap-none
          scrollbar-hide pb-2 md:pb-0
          pt-5 md:pt-0
          md:items-stretch md:px-4
          ${mode === "matric" ? "md:grid-cols-2" : mode === "upgrade" ? "md:grid-cols-3" : "md:grid-cols-4"}
        `}
      >
        {visiblePlans.map((plan, index) => {
          const final = effectivePrice(plan);
          const voucherApplied = !!appliedVoucher && final < plan.priceRands;
          const isLoading = loadingPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={`
                relative border-2 rounded-2xl bg-white flex flex-col
                flex-shrink-0 w-[calc(100vw-2rem)] mx-4 md:mx-0 md:w-auto snap-center snap-always
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

              <div className="p-4 flex flex-col flex-1 gap-3">
                {/* Name + subtitle */}
                <div>
                  <h2 className="text-lg font-extrabold text-[#1a2744]">{plan.name}</h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="space-y-0.5">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-[#1a2744]">
                      {plan.isFree ? "Free" : (
                        <>
                          R{voucherApplied ? final : basePrice(plan)}
                          {plan.paymentType === "subscription" ? (
                            <span className="text-sm font-semibold text-gray-400">
                              {billingCycle === "weekly" && WEEKLY_PRICES[plan.key] != null ? "/wk" : "/mo"}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-blue-500">/once-off</span>
                          )}
                        </>
                      )}
                    </span>
                    {!plan.isFree && (plan.isLaunchOffer || voucherApplied) && (
                      <span className="text-sm text-gray-400 line-through mb-1">
                        R{voucherApplied ? basePrice(plan) : plan.originalPrice}
                      </span>
                    )}
                  </div>
                  {!plan.isFree && plan.isLaunchOffer && !voucherApplied && (
                    <span className="inline-block text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                      {plan.savingsLabel ?? `Launch Offer, Save R${plan.originalPrice - plan.priceRands}/mo`}
                    </span>
                  )}
                  {voucherApplied && (
                    <span className="inline-block text-xs font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      Voucher applied
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
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

                {/* Per-plan CTA */}
                <button
                  onClick={() => { scrollToCard(index); handlePlanCTA(plan); }}
                  disabled={!!loadingPlan}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 ${plan.ctaClass} ${
                    CONCEPT_C ? "shadow-lip active:translate-y-[3px] active:shadow-none" : ""
                  }`}
                >
                  {isLoading ? "Redirecting…" : plan.ctaLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel dots — mobile only */}
      <div className="flex md:hidden justify-center gap-2 mt-4 px-4">
        {visiblePlans.map((plan, i) => (
          <button
            key={plan.key}
            onClick={() => scrollToCard(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeCard === i ? "w-5 bg-rose-500" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2 text-center mt-3 mx-4">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-3 px-4">
        Subscriptions cancel anytime · Secure payment via PayFast
      </p>
    </div>
  );
}
