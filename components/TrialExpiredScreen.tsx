"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const PLANS: { key: string; label: string; price: string; color: string; features: string[] }[] = [
  {
    key: "starter",
    label: "Starter",
    price: "R149 / month",
    color: "border-blue-400",
    features: ["Maths Engine", "Reading Engine", "Progress Reports", "General Homework Chat"],
  },
  {
    key: "pro",
    label: "Pro",
    price: "R299 / month",
    color: "border-purple-400",
    features: ["Everything in Starter", "Unlimited questions", "PDF Reports", "Priority support"],
  },
  {
    key: "ultimate",
    label: "Ultimate",
    price: "R499 / month",
    color: "border-amber-400",
    features: ["Everything in Pro", "Multiple learner profiles", "Parent dashboard", "Live tutor sessions"],
  },
];

export default function TrialExpiredScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ plan }),
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

        <div className="space-y-3">
          {PLANS.map((plan) => (
            <div key={plan.key} className={`border-2 ${plan.color} rounded-2xl p-4 space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">{plan.label}</span>
                <span className="text-sm font-semibold text-gray-600">{plan.price}</span>
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
          ))}
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
