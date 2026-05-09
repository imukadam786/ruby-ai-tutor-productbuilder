import type { Paper } from "./papers";

import mathP1_2025 from "@/data/papers/math-p1-may-jun-2025.json";
import mathP2_2025 from "@/data/papers/math-p2-may-jun-2025.json";
import mathP1_2024 from "@/data/papers/math-p1-may-jun-2024.json";
import mathP2_2024 from "@/data/papers/math-p2-may-jun-2024.json";
import mathP1_2023 from "@/data/papers/math-p1-may-jun-2023.json";
import mathP2_2023 from "@/data/papers/math-p2-may-jun-2023.json";
import mathP1_2022 from "@/data/papers/math-p1-may-jun-2022.json";
import mathP2_2022 from "@/data/papers/math-p2-may-jun-2022.json";
import mathP1_2021 from "@/data/papers/math-p1-may-jun-2021.json";
import mathP2_2021 from "@/data/papers/math-p2-may-jun-2021.json";
import mathP1_prep2026a from "@/data/papers/math-p1-prep-2026a.json";
import mathP1_prep2026b from "@/data/papers/math-p1-prep-2026b.json";
import mathP2_pred_2026 from "@/data/papers/math-p2-predictive-2026.json";

export const MATHS_PAPERS: Paper[] = [
  mathP1_prep2026a as unknown as Paper,
  mathP1_prep2026b as unknown as Paper,
  mathP2_pred_2026 as unknown as Paper,
  mathP1_2025 as unknown as Paper,
  mathP2_2025 as unknown as Paper,
  mathP1_2024 as unknown as Paper,
  mathP2_2024 as unknown as Paper,
  mathP1_2023 as unknown as Paper,
  mathP2_2023 as unknown as Paper,
  mathP1_2022 as unknown as Paper,
  mathP2_2022 as unknown as Paper,
  mathP1_2021 as unknown as Paper,
  mathP2_2021 as unknown as Paper,
];
