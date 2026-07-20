// ─── Concept C · foundation preview ──────────────────────────────────────────
// A standalone sign-off page for Phase 0. Shows the <Gem> in every state, all
// per-subject colours, the reserved tiers, and the chunky 4-colour answer
// buttons — so the team can approve the gem system + palette + button depth
// before Phase 1 touches a screen. Reachable at /concept-preview.

import Gem from "@/components/ui/Gem";
import {
  GEM_HEX,
  RUBY,
  GEM_GOLD,
  ANSWER_COLORS,
  type GemColor,
  type GemState,
} from "@/lib/design/gemColors";

const STATES: { state: GemState; label: string; note: string }[] = [
  { state: "rough", label: "Rough", note: "not learned" },
  { state: "cutting", label: "Cutting", note: "in progress" },
  { state: "polished", label: "Polished", note: "mastered" },
  { state: "rare", label: "Rare", note: "whole topic" },
  { state: "locked", label: "Locked", note: "not open yet" },
];

const SUBJECTS: { key: GemColor; name: string }[] = [
  { key: "blue", name: "Maths" },
  { key: "purple", name: "English" },
  { key: "cyan", name: "Geography" },
  { key: "amber", name: "History" },
  { key: "emerald", name: "Life Sci / Accounting" },
  { key: "indigo", name: "Economics / Maths Lit" },
  { key: "sky", name: "Business" },
  { key: "teal", name: "Tourism" },
  { key: "violet", name: "EMS" },
  { key: "slate", name: "Technology" },
  { key: "orange", name: "Social Sciences" },
  { key: "lime", name: "Life Orientation" },
  { key: "pink", name: "Creative Arts" },
  { key: "rose", name: "Phys / Nat Sciences" },
];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function ConceptPreview() {
  return (
    <div className="min-h-screen bg-[#fbf6f4] text-[#2a1622] p-6 sm:p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <p className="inline-flex items-center gap-2 bg-[#FFF1F4] text-[#E11D48] font-extrabold text-xs tracking-widest uppercase px-3.5 py-1.5 rounded-full">
          🧱 Phase 0 · foundation preview
        </p>
        <h1 className="text-3xl sm:text-4xl font-black mt-4 mb-2">The gem system — sign-off</h1>
        <p className="text-gray-500 font-semibold mb-8 max-w-prose">
          The live <code>&lt;Gem&gt;</code> component, the palette, and the chunky answer buttons.
          Everything on this page is the real foundation Phase 1 will build on.
        </p>

        <Card title="The 5 states (shown in ruby)">
          <div className="flex flex-wrap gap-6">
            {STATES.map((s) => (
              <div key={s.state} className="flex flex-col items-center gap-2 w-20 text-center">
                <Gem color={RUBY} state={s.state} className="w-11 h-14" />
                <div className="text-sm font-extrabold">{s.label}</div>
                <div className="text-xs text-gray-500 font-semibold leading-tight">{s.note}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Per-subject colours (polished)">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-5">
            {SUBJECTS.map((sub) => (
              <div key={sub.key} className="flex flex-col items-center gap-1.5 text-center">
                <Gem color={GEM_HEX[sub.key]} state="polished" className="w-9 h-11" />
                <div className="text-[11px] font-extrabold leading-tight">{sub.name}</div>
                <div className="text-[9px] text-gray-400 font-mono">{GEM_HEX[sub.key]}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Reserved tiers">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <Gem color={RUBY} state="polished" className="w-8 h-10" />
              <div>
                <div className="font-extrabold text-sm">Ruby</div>
                <div className="text-xs text-gray-500 font-semibold">brand only — streak, “you are here”</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Gem color={GEM_GOLD} state="rare" className="w-8 h-10" />
              <div>
                <div className="font-extrabold text-sm">Gold</div>
                <div className="text-xs text-gray-500 font-semibold">rare — finishing a whole topic</div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Answer buttons — 4 colours, chunky offset shadow">
          <p className="text-sm text-gray-500 font-semibold mb-4">
            Fixed set, same on every question. Colour never implies the answer — right/wrong shows on submit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            {ANSWER_COLORS.map((c, i) => (
              <button
                key={c.key}
                type="button"
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-white font-extrabold text-left transition-transform active:translate-y-[3px] active:shadow-none"
                style={{ background: c.bg, boxShadow: `0 5px 0 0 ${c.lip}` }}
              >
                <span className="w-6 h-6 rounded-lg bg-white/25 flex items-center justify-center text-sm">
                  {c.key}
                </span>
                {["4⁄12", "7⁄8", "1⁄2", "4⁄8"][i]}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 font-semibold mt-4">Tap one — feel the press (the lip depth you asked for).</p>
        </Card>

        <p className="text-xs text-gray-400 font-semibold mt-8">
          Font: Nunito (loaded). Ship behind <code>NEXT_PUBLIC_CONCEPT_C=1</code>. This page is dev-only.
        </p>
      </div>
    </div>
  );
}
