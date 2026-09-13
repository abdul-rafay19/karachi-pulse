import { NextRequest, NextResponse } from "next/server";
import { KARACHI_CENTER } from "@/data/areas";
import { fallbackWeather, fetchOpenMeteo } from "@/lib/weather/openMeteo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latitude = Number(searchParams.get("lat")) || KARACHI_CENTER.latitude;
  const longitude = Number(searchParams.get("lng")) || KARACHI_CENTER.longitude;

  try {
    const snapshot = await fetchOpenMeteo({ latitude, longitude });
    return NextResponse.json({ weather: snapshot, degraded: false });
  } catch {
    return NextResponse.json({
      weather: fallbackWeather(),
      degraded: true,
      message: "Live weather is temporarily unavailable. Showing a demo estimate instead.",
    });
  }
}
