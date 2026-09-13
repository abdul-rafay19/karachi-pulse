import { getAreaById } from "@/data/areas";
import { Complaint, ComplaintCategory, Severity } from "@/types";
import { analyzeComplaintFallback } from "@/lib/ai/fallback";

const SEVERITY_NUMERIC: Record<Severity, number> = {
  low: 20,
  moderate: 45,
  high: 70,
  critical: 95,
};

interface SeedSpec {
  areaId: string;
  category: ComplaintCategory;
  description: string;
  severity: Severity;
  hoursAgo: number;
  jitterIndex: number;
}

// Small fixed offsets (not random) so every complaint gets a slightly
// different pin on the map without needing GPS precision or an RNG.
const JITTER_STEPS: Array<[number, number]> = [
  [0, 0], [0.006, 0.004], [-0.005, 0.006], [0.004, -0.006], [-0.006, -0.003],
  [0.008, 0.001], [-0.003, 0.008], [0.002, -0.008], [-0.008, 0.002], [0.005, 0.005],
];

function jitter(lat: number, lng: number, index: number): [number, number] {
  const [dLat, dLng] = JITTER_STEPS[index % JITTER_STEPS.length];
  return [lat + dLat, lng + dLng];
}

// --- Scenario A: Korangi — flood risk (drainage + sewage + rain) ---
const KORANGI: SeedSpec[] = [
  { areaId: "korangi", category: "flooding", description: "Water has accumulated near the main road after yesterday's rain and vehicles are struggling to pass.", severity: "high", hoursAgo: 2, jitterIndex: 0 },
  { areaId: "korangi", category: "flooding", description: "Drain near Korangi Crossing is completely blocked, water is backing up onto the street.", severity: "critical", hoursAgo: 4, jitterIndex: 1 },
  { areaId: "korangi", category: "sewage", description: "Sewage line has overflowed near the residential blocks, strong smell and standing dirty water.", severity: "critical", hoursAgo: 6, jitterIndex: 2 },
  { areaId: "korangi", category: "flooding", description: "Waterlogging outside the market has not cleared in two days, shops are struggling with access.", severity: "high", hoursAgo: 9, jitterIndex: 3 },
  { areaId: "korangi", category: "roads", description: "Road obstruction caused by debris that washed up during the waterlogging near sector 31.", severity: "moderate", hoursAgo: 14, jitterIndex: 4 },
  { areaId: "korangi", category: "sewage", description: "Manhole cover is missing and sewage is bubbling up onto the road, dangerous at night.", severity: "high", hoursAgo: 20, jitterIndex: 5 },
  { areaId: "korangi", category: "flooding", description: "Another round of waterlogging near the same drain from last week, it never got fixed.", severity: "high", hoursAgo: 26, jitterIndex: 6 },
  { areaId: "korangi", category: "water", description: "Water supply line seems to be mixing with the nearby sewage overflow, tap water smells odd.", severity: "moderate", hoursAgo: 33, jitterIndex: 7 },
];

// --- Scenario B: Landhi — electricity risk (outages + storm) ---
const LANDHI: SeedSpec[] = [
  { areaId: "landhi", category: "electricity", description: "Power has been out for six hours after last night's wind, transformer might be damaged.", severity: "high", hoursAgo: 3, jitterIndex: 0 },
  { areaId: "landhi", category: "electricity", description: "Exposed wiring near the industrial gate is sparking whenever it drizzles, very dangerous.", severity: "critical", hoursAgo: 7, jitterIndex: 1 },
  { areaId: "landhi", category: "electricity", description: "Repeated tripping in our block, lights flicker every time the wind picks up.", severity: "moderate", hoursAgo: 12, jitterIndex: 2 },
  { areaId: "landhi", category: "electricity", description: "A low-hanging cable came down near the factory road after the storm last evening.", severity: "high", hoursAgo: 18, jitterIndex: 3 },
  { areaId: "landhi", category: "roads", description: "Potholes filled with rainwater are hiding how deep they are, a motorcyclist nearly fell.", severity: "moderate", hoursAgo: 24, jitterIndex: 4 },
  { areaId: "landhi", category: "electricity", description: "Voltage has been unstable for two days, several appliances have already been damaged.", severity: "moderate", hoursAgo: 30, jitterIndex: 5 },
];

// --- Scenario C: Gulshan-e-Iqbal — waste risk (increasing trend) ---
const GULSHAN: SeedSpec[] = [
  { areaId: "gulshan-e-iqbal", category: "waste", description: "Garbage has not been collected from our street corner in over a week, pile is growing.", severity: "moderate", hoursAgo: 1, jitterIndex: 0 },
  { areaId: "gulshan-e-iqbal", category: "waste", description: "Overflowing waste bin near the park is attracting stray animals and a strong smell.", severity: "moderate", hoursAgo: 3, jitterIndex: 1 },
  { areaId: "gulshan-e-iqbal", category: "waste", description: "Construction debris dumped illegally on the service road, blocking half the lane.", severity: "high", hoursAgo: 8, jitterIndex: 2 },
  { areaId: "gulshan-e-iqbal", category: "waste", description: "Another uncollected garbage pile near block 13, this is the third report this week.", severity: "moderate", hoursAgo: 15, jitterIndex: 3 },
  { areaId: "gulshan-e-iqbal", category: "waste", description: "Waste is being burned openly near the residential area in the evenings.", severity: "moderate", hoursAgo: 40, jitterIndex: 4 },
  { areaId: "gulshan-e-iqbal", category: "roads", description: "A pothole outside the university road has widened after the last rain.", severity: "low", hoursAgo: 55, jitterIndex: 5 },
];

// --- Scenario D: Nazimabad — road risk (potholes + obstruction + rain) ---
const NAZIMABAD: SeedSpec[] = [
  { areaId: "nazimabad", category: "roads", description: "Large pothole near the main chowk has gotten worse and is now a real hazard for bikes.", severity: "high", hoursAgo: 5, jitterIndex: 0 },
  { areaId: "nazimabad", category: "roads", description: "Road obstruction from a fallen tree branch is forcing traffic into a single lane.", severity: "moderate", hoursAgo: 11, jitterIndex: 1 },
  { areaId: "nazimabad", category: "flooding", description: "Rainwater pools at the same low point on the road every time it rains, no drainage.", severity: "moderate", hoursAgo: 22, jitterIndex: 2 },
  { areaId: "nazimabad", category: "roads", description: "Multiple potholes near the market have merged into one large crater.", severity: "high", hoursAgo: 29, jitterIndex: 3 },
  { areaId: "nazimabad", category: "electricity", description: "Streetlights have been off for a week, area is very dark at night.", severity: "moderate", hoursAgo: 46, jitterIndex: 4 },
];

// --- Scenario E: Clifton — low risk (few, isolated, low severity) ---
const CLIFTON: SeedSpec[] = [
  { areaId: "clifton", category: "waste", description: "A small litter buildup near the beach access road, not urgent but worth a cleanup.", severity: "low", hoursAgo: 60, jitterIndex: 0 },
  { areaId: "clifton", category: "roads", description: "Minor crack forming on the service lane, easy to avoid for now.", severity: "low", hoursAgo: 84, jitterIndex: 1 },
];

// --- Light baseline coverage for the remaining Karachi areas ---
const BASELINE: SeedSpec[] = [
  { areaId: "malir", category: "water", description: "Water pressure has been low in our block for the past two days.", severity: "moderate", hoursAgo: 28, jitterIndex: 0 },
  { areaId: "malir", category: "roads", description: "Unpaved stretch turns muddy and hard to cross whenever it rains.", severity: "low", hoursAgo: 50, jitterIndex: 1 },
  { areaId: "gulistan-e-johar", category: "waste", description: "Garbage bin near block 15 has not been emptied in several days.", severity: "moderate", hoursAgo: 20, jitterIndex: 0 },
  { areaId: "gulistan-e-johar", category: "electricity", description: "Brief power cuts have been happening most evenings this week.", severity: "low", hoursAgo: 44, jitterIndex: 1 },
  { areaId: "north-nazimabad", category: "roads", description: "Speed breaker has worn down and is now barely visible at night.", severity: "low", hoursAgo: 38, jitterIndex: 0 },
  { areaId: "orangi-town", category: "sewage", description: "Open sewage line near the main road has been an ongoing issue for months.", severity: "high", hoursAgo: 16, jitterIndex: 0 },
  { areaId: "orangi-town", category: "water", description: "Water tanker deliveries have been delayed for our street twice this week.", severity: "moderate", hoursAgo: 52, jitterIndex: 1 },
  { areaId: "site", category: "electricity", description: "Industrial area transformer has been making a loud humming noise since yesterday.", severity: "moderate", hoursAgo: 34, jitterIndex: 0 },
  { areaId: "lyari", category: "waste", description: "Waste collection point near the river has overflowed onto the walkway.", severity: "moderate", hoursAgo: 25, jitterIndex: 0 },
  { areaId: "lyari", category: "flooding", description: "Low-lying street near the riverbank floods quickly even with light rain.", severity: "moderate", hoursAgo: 41, jitterIndex: 1 },
  { areaId: "saddar", category: "roads", description: "Traffic congestion made worse by an unmarked road obstruction near the market.", severity: "low", hoursAgo: 47, jitterIndex: 0 },
  { areaId: "dha", category: "water", description: "Occasional low water pressure reported in phase 6, seems intermittent.", severity: "low", hoursAgo: 66, jitterIndex: 0 },
  { areaId: "pechs", category: "electricity", description: "Short power blip affected a few streets this morning, resolved quickly.", severity: "low", hoursAgo: 30, jitterIndex: 0 },
  { areaId: "shah-faisal-colony", category: "roads", description: "Pothole cluster near the flyover has grown after recent traffic.", severity: "moderate", hoursAgo: 19, jitterIndex: 0 },
  { areaId: "federal-b-area", category: "waste", description: "Garbage pickup missed our lane again this week.", severity: "low", hoursAgo: 58, jitterIndex: 0 },
  { areaId: "new-karachi", category: "water", description: "Water supply has been irregular, arriving only every other day.", severity: "moderate", hoursAgo: 36, jitterIndex: 0 },
  { areaId: "baldia-town", category: "sewage", description: "Sewage backing up near the main drain after last week's rain still hasn't cleared.", severity: "high", hoursAgo: 13, jitterIndex: 0 },
  { areaId: "keamari", category: "roads", description: "Heavy truck traffic has damaged the road surface near the port entrance.", severity: "moderate", hoursAgo: 27, jitterIndex: 0 },
  { areaId: "bin-qasim", category: "electricity", description: "Voltage fluctuation reported near the industrial zone.", severity: "low", hoursAgo: 62, jitterIndex: 0 },
  { areaId: "surjani-town", category: "water", description: "Water tanker did not arrive on the scheduled day this week.", severity: "low", hoursAgo: 70, jitterIndex: 0 },
  { areaId: "model-colony", category: "roads", description: "Uneven road surface near the airport link road, minor but noticeable.", severity: "low", hoursAgo: 54, jitterIndex: 0 },
  { areaId: "liaquatabad", category: "waste", description: "Garbage collection point overflowing near the main intersection.", severity: "moderate", hoursAgo: 21, jitterIndex: 0 },
  { areaId: "korangi-industrial-area", category: "electricity", description: "Factory-adjacent street has had flickering streetlights for a few nights.", severity: "low", hoursAgo: 45, jitterIndex: 0 },
];

const ALL_SPECS = [...KORANGI, ...LANDHI, ...GULSHAN, ...NAZIMABAD, ...CLIFTON, ...BASELINE];

/**
 * Builds the synthetic Karachi demo dataset relative to "now" so recency
 * and trend calculations always look freshly alive, no matter when the
 * demo is actually run. The underlying spec list is fixed (deterministic);
 * only the resulting timestamps shift with the clock.
 */
export function generateSeedComplaints(now: number = Date.now()): Complaint[] {
  return ALL_SPECS.map((spec, idx) => {
    const area = getAreaById(spec.areaId);
    if (!area) throw new Error(`Unknown seed area id: ${spec.areaId}`);
    const [lat, lng] = jitter(area.latitude, area.longitude, spec.jitterIndex);
    const createdAt = new Date(now - spec.hoursAgo * 36e5).toISOString();
    const aiAnalysis = analyzeComplaintFallback({
      description: spec.description,
      userSeverity: spec.severity,
    });

    const complaint: Complaint = {
      id: `seed-${idx}-${spec.areaId}`,
      category: spec.category,
      description: spec.description,
      areaId: spec.areaId,
      latitude: lat,
      longitude: lng,
      severity: Math.round((SEVERITY_NUMERIC[spec.severity] + aiAnalysis.severity) / 2),
      userSeverity: spec.severity,
      urgency: aiAnalysis.urgency,
      createdAt,
      aiAnalysis,
      source: "demo",
    };
    return complaint;
  });
}
