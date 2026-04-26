import type { Paper } from "./papers";

import lifeSciP1_2025 from "@/data/papers/life-sci-p1-may-jun-2025.json";
import lifeSciP1_2023 from "@/data/papers/life-sci-p1-may-jun-2023.json";

export const LIFE_SCI_PAPERS: Paper[] = [
  lifeSciP1_2025 as unknown as Paper,
  lifeSciP1_2023 as unknown as Paper,
];
