import { NextRequest, NextResponse } from "next/server";
import { analyzeComplaint } from "@/lib/ai/provider";
import { Severity } from "@/types";

const VALID_SEVERITIES: Severity[] = ["low", "moderate", "high", "critical"];

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { description, areaName, userSeverity } = (body ?? {}) as Record<string, unknown>;

  if (typeof description !== "string" || description.trim().length < 3) {
    return NextResponse.json(
      { error: "A complaint description of at least 3 characters is required." },
      { status: 400 }
    );
  }

  const safeAreaName = typeof areaName === "string" && areaName.trim() ? areaName : "Karachi";
  const safeSeverity = VALID_SEVERITIES.includes(userSeverity as Severity)
    ? (userSeverity as Severity)
    : undefined;

  const result = await analyzeComplaint({
    description: description.trim().slice(0, 1000),
    areaName: safeAreaName,
    userSeverity: safeSeverity,
  });

  return NextResponse.json(result);
}
