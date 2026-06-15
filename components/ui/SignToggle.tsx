"use client";

/**
 * ± sign toggle for numeric answer inputs.
 *
 * iOS number / decimal keypads have no minus key, so learners can't type a
 * negative answer (e.g. -3 °C). This button prepends or strips a leading minus
 * on the current value, keeping the fast number pad in place. Pass `className`
 * to match the height / rounding of the input it sits beside.
 */
export default function SignToggle({
  value,
  onChange,
  disabled,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const negative = value.startsWith("-");
  return (
    <button
      type="button"
      aria-label={negative ? "Make answer positive" : "Make answer negative"}
      aria-pressed={negative}
      disabled={disabled}
      onClick={() => onChange(negative ? value.slice(1) : "-" + value)}
      title="Toggle negative (±)"
      className={`shrink-0 select-none border-2 font-bold leading-none transition-colors disabled:opacity-50 ${
        negative
          ? "border-slate-700 bg-slate-700 text-white"
          : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
      } ${className}`}
    >
      ±
    </button>
  );
}
