import type { Paper } from "./papers";

import mathsLitP1_mayJun_2026_predictive from "@/data/papers/maths-lit-p1-may-jun-2026-predictive-combined.json";
import mathsLitP2_mayJun_2026_predictive from "@/data/papers/maths-lit-p2-may-jun-2026-predictive-combined.json";

export const MATHS_LIT_PAPERS: Paper[] = [
  mathsLitP1_mayJun_2026_predictive as unknown as Paper,
  mathsLitP2_mayJun_2026_predictive as unknown as Paper,
];
