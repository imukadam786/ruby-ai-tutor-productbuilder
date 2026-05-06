import type { Paper } from "./papers";

import ecoP1_mayJun_2026_predictive from "@/data/papers/eco-p1-may-jun-2026-predictive-combined.json";
import ecoP2_mayJun_2026_predictive from "@/data/papers/eco-p2-may-jun-2026-predictive-combined.json";

export const ECONOMICS_PAPERS: Paper[] = [
  ecoP1_mayJun_2026_predictive as unknown as Paper,
  ecoP2_mayJun_2026_predictive as unknown as Paper,
];
