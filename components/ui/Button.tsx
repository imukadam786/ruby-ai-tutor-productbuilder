"use client";

// ─── Shared Button ───────────────────────────────────────────────────────────
//
// The one button used across the whole app. Before this existed every screen
// hand-rolled its own Tailwind, which drifted into 5+ shapes and 3 different
// "Ruby red" hover shades — and the half-width `rounded-full` pills collapsed
// into circles when their label wrapped to two lines.
//
// Rules this enforces everywhere:
//   • one red  (#BE1832) and one hover red (#a01528)
//   • rounded-2xl (never `rounded-full`, so a button can never become a circle)
//   • labels never wrap (whitespace-nowrap) — they stay on one line
//   • a comfortable minimum tap height on every size
//
// Use `variant` for intent and `size` for scale; pass `fullWidth` to stretch.

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";

export type ButtonVariant = "primary" | "success" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the full width of the parent. */
  fullWidth?: boolean;
  children: ReactNode;
}

/** Tiny class joiner — drops falsy values so conditional classes stay tidy. */
function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const BASE =
  "inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BE1832]/40 " +
  "active:scale-[0.98] disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[#BE1832] hover:bg-[#a01528] text-white disabled:bg-gray-300",
  success:
    "bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300",
  outline:
    "border-2 border-[#BE1832] text-[#BE1832] hover:bg-[#BE1832]/5 disabled:border-gray-200 disabled:text-gray-300",
  ghost:
    "text-[#BE1832] hover:bg-[#BE1832]/5 disabled:text-gray-300",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-[2.25rem] px-3.5 py-1.5 text-sm rounded-xl",
  md: "min-h-[2.75rem] px-5 py-2.5 text-base rounded-2xl",
  lg: "min-h-[3.25rem] px-6 py-4 text-lg rounded-2xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, className, type, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cx(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
