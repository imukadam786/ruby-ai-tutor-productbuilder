import type { Paper } from "./papers";

import busStudP1_mayJun_2021 from "@/data/papers/bus-stud-p1-may-jun-2021-combined.json";
import busStudP1_mayJun_2022 from "@/data/papers/bus-stud-p1-may-jun-2022-combined.json";
import busStudP1_mayJun_2023 from "@/data/papers/bus-stud-p1-may-jun-2023-combined.json";
import busStudP1_mayJun_2024 from "@/data/papers/bus-stud-p1-may-jun-2024-combined.json";
import busStudP1_mayJun_2025 from "@/data/papers/bus-stud-p1-may-jun-2025-combined.json";

export const BUS_STUD_PAPERS: Paper[] = [
  busStudP1_mayJun_2025 as unknown as Paper,
  busStudP1_mayJun_2024 as unknown as Paper,
  busStudP1_mayJun_2023 as unknown as Paper,
  busStudP1_mayJun_2022 as unknown as Paper,
  busStudP1_mayJun_2021 as unknown as Paper,
];
