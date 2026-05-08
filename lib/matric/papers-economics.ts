import type { Paper } from "./papers";

import ecoP1_mayJun_2026_predictive from "@/data/papers/eco-p1-may-jun-2026-predictive-combined.json";
import ecoP2_mayJun_2026_predictive from "@/data/papers/eco-p2-may-jun-2026-predictive-combined.json";
import ecoP1_mayJun_2025 from "@/data/papers/eco-p1-may-jun-2025-combined.json";
import ecoP1_mayJun_2024 from "@/data/papers/eco-p1-may-jun-2024-combined.json";
import ecoP1_mayJun_2023 from "@/data/papers/eco-p1-may-jun-2023-combined.json";
import ecoP2_mayJun_2023 from "@/data/papers/eco-p2-may-jun-2023-combined.json";
import ecoP1_mayJun_2022 from "@/data/papers/eco-p1-may-jun-2022-combined.json";

export const ECONOMICS_PAPERS: Paper[] = [
  ecoP1_mayJun_2026_predictive as unknown as Paper,
  ecoP2_mayJun_2026_predictive as unknown as Paper,
  ecoP1_mayJun_2025 as unknown as Paper,
  ecoP1_mayJun_2024 as unknown as Paper,
  ecoP1_mayJun_2023 as unknown as Paper,
  ecoP2_mayJun_2023 as unknown as Paper,
  ecoP1_mayJun_2022 as unknown as Paper,
];
