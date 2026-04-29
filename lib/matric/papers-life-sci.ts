import type { Paper } from "./papers";

import lifeSciP1_pred_2026 from "@/data/papers/life-sci-p1-predictive-2026.json";
import lifeSciP2_pred_2026 from "@/data/papers/life-sci-p2-predictive-2026.json";
import lifeSciP1_2025 from "@/data/papers/life-sci-p1-may-jun-2025.json";
import lifeSciP1_2023 from "@/data/papers/life-sci-p1-may-jun-2023.json";
import lifeSciP1_2022 from "@/data/papers/life-sci-p1-may-jun-2022-combine.json";

export const LIFE_SCI_PAPERS: Paper[] = [
  lifeSciP1_pred_2026 as unknown as Paper,
  lifeSciP2_pred_2026 as unknown as Paper,
  lifeSciP1_2025 as unknown as Paper,
  lifeSciP1_2023 as unknown as Paper,
  lifeSciP1_2022 as unknown as Paper,
];
