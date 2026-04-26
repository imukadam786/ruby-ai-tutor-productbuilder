import type { Paper } from "./papers";

import geoP1_2025 from "@/data/papers/geo-p1-may-jun-2025.json";
import geoP1_2024 from "@/data/papers/geo-p1-may-jun-2024.json";
import geoP1_2023 from "@/data/papers/geo-p1-may-jun-2023.json";

export const GEO_PAPERS: Paper[] = [
  geoP1_2025 as unknown as Paper,
  geoP1_2024 as unknown as Paper,
  geoP1_2023 as unknown as Paper,
];
