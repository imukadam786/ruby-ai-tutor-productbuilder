import type { Paper } from "./papers";

import afrP1_pred_2026 from "@/data/papers/afr-fal-p1-predictive-2026.json";
import afrP2_pred_2026 from "@/data/papers/afr-fal-p2-predictive-2026.json";
import afrP3_pred_2026 from "@/data/papers/afr-fal-p3-predictive-2026.json";
import afrP1_2025 from "@/data/papers/afr-fal-p1-may-jun-2025.json";
import afrP1_2024 from "@/data/papers/afr-fal-p1-may-jun-2024-combined.json";
import afrP1_2023 from "@/data/papers/afr-fal-p1-may-jun-2023-combined.json";
import afrP1_2022 from "@/data/papers/afr-fal-p1-may-jun-2022.json";

export const AFRIKAANS_PAPERS: Paper[] = [
  afrP1_pred_2026 as unknown as Paper,
  afrP2_pred_2026 as unknown as Paper,
  afrP3_pred_2026 as unknown as Paper,
  afrP1_2025 as unknown as Paper,
  afrP1_2024 as unknown as Paper,
  afrP1_2023 as unknown as Paper,
  afrP1_2022 as unknown as Paper,
];
