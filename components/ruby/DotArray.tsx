// Shared dot-array renderer for "Count the dots" (M001) questions. The exact
// blue-circle style is used both in the Discovery placement activity
// (MathsDiagnosticPlacement) and the main practice session (QuestionCard), so it
// lives here to stay identical in both places.

/** Pull the dot count out of a "Dot array: N dots (...)" stimulus/context
 *  string. Returns null when the string is not a dot array. */
export function parseDotArray(stimulus: string | undefined | null): number | null {
  if (!stimulus) return null;
  const m = stimulus.match(/Dot array:\s*(\d+)\s*dots/i);
  return m ? parseInt(m[1], 10) : null;
}

/** A randomised-looking group of dots the child counts — blue-600 circles on a
 *  soft blue card, wrapping and centred. */
export function DotArray({ count }: { count: number }) {
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-50 rounded-2xl p-5 flex flex-wrap gap-3 justify-center items-center min-h-[100px]">
      {dots.map((i) => (
        <div key={i} className="w-8 h-8 rounded-full bg-blue-600 shadow-sm flex-shrink-0" />
      ))}
    </div>
  );
}
