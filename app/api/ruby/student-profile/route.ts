import { NextRequest, NextResponse } from "next/server";

// This route is a pass-through for client-side localStorage operations.
// It returns the initial skill tree structure so the client can bootstrap.

import skillTreeData from "@/data/skill-tree.json";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    skill_tree: skillTreeData,
    total_levels: skillTreeData.levels.length,
    total_skills: skillTreeData.levels.reduce(
      (total, level) =>
        total +
        level.tiers.reduce(
          (t, tier) => t + tier.atomic_skills.length,
          0
        ),
      0
    ),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate profile structure
    if (!body.name || !body.grade) {
      return NextResponse.json(
        { error: "name and grade are required" },
        { status: 400 }
      );
    }
    // Profile is stored client-side; just return success
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
