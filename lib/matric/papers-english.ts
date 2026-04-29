import type { Paper } from "./papers";

import engP1_pred_2026 from "@/data/papers/eng-hl-p1-predictive-2026.json";
import engP2_pred_2026 from "@/data/papers/eng-hl-p2-predictive-2026.json";
import engP3_pred_2026 from "@/data/papers/eng-hl-p3-predictive-2026.json";
import engP1_2023 from "@/data/papers/eng-hl-p1-may-jun-2023.json";
import engP1_2024 from "@/data/papers/eng-hl-p1-may-jun-2024.json";
import engP1_2025 from "@/data/papers/eng-hl-p1-may-jun-2025.json";
import engP2_2023 from "@/data/papers/eng-hl-p2-may-jun-2023.json";
import engP2_2024 from "@/data/papers/eng-hl-p2-may-jun-2024-combined.json";
import engP2_2025 from "@/data/papers/eng-hl-p2-may-jun-2025-combined.json";
import engP3_2023 from "@/data/papers/eng-hl-p3-may-jun-2023.json";
import engP3_2024 from "@/data/papers/eng-hl-p3-may-jun-2024-combined.json";
import engP3_2025 from "@/data/papers/eng-hl-p3-may-jun-2025-combined.json";

export const ENGLISH_PAPERS: Paper[] = [
  engP1_pred_2026 as unknown as Paper,
  engP2_pred_2026 as unknown as Paper,
  engP3_pred_2026 as unknown as Paper,
  engP1_2025 as unknown as Paper,
  engP1_2024 as unknown as Paper,
  engP1_2023 as unknown as Paper,
  engP2_2025 as unknown as Paper,
  engP2_2024 as unknown as Paper,
  engP2_2023 as unknown as Paper,
  engP3_2025 as unknown as Paper,
  engP3_2024 as unknown as Paper,
  engP3_2023 as unknown as Paper,
];
