import { Area } from "@/types";

// Approximate real-world coordinates for well-known Karachi localities.
// Coordinates are intentionally rounded to a sensible public-map precision —
// this is a monitoring overlay, not a survey-grade cadastral map.
export const KARACHI_CENTER = { latitude: 24.8607, longitude: 67.0011 };

export const AREAS: Area[] = [
  { id: "korangi", name: "Korangi", latitude: 24.8438, longitude: 67.1244, radiusMeters: 1800, isDemoFocus: true },
  { id: "landhi", name: "Landhi", latitude: 24.8358, longitude: 67.1897, radiusMeters: 1800, isDemoFocus: true },
  { id: "malir", name: "Malir", latitude: 24.8956, longitude: 67.1936, radiusMeters: 2000 },
  { id: "gulshan-e-iqbal", name: "Gulshan-e-Iqbal", latitude: 24.9200, longitude: 67.0947, radiusMeters: 1700, isDemoFocus: true },
  { id: "gulistan-e-johar", name: "Gulistan-e-Johar", latitude: 24.9186, longitude: 67.1279, radiusMeters: 1800 },
  { id: "nazimabad", name: "Nazimabad", latitude: 24.9089, longitude: 67.0361, radiusMeters: 1500, isDemoFocus: true },
  { id: "north-nazimabad", name: "North Nazimabad", latitude: 24.9403, longitude: 67.0379, radiusMeters: 1700 },
  { id: "orangi-town", name: "Orangi Town", latitude: 24.9407, longitude: 66.9764, radiusMeters: 2200 },
  { id: "site", name: "SITE", latitude: 24.8890, longitude: 67.0426, radiusMeters: 1600 },
  { id: "lyari", name: "Lyari", latitude: 24.8770, longitude: 66.9930, radiusMeters: 1500 },
  { id: "saddar", name: "Saddar", latitude: 24.8567, longitude: 67.0225, radiusMeters: 1300 },
  { id: "clifton", name: "Clifton", latitude: 24.8138, longitude: 67.0300, radiusMeters: 1700, isDemoFocus: true },
  { id: "dha", name: "DHA", latitude: 24.7969, longitude: 67.0654, radiusMeters: 2200 },
  { id: "pechs", name: "PECHS", latitude: 24.8720, longitude: 67.0653, radiusMeters: 1200 },
  { id: "shah-faisal-colony", name: "Shah Faisal Colony", latitude: 24.8836, longitude: 67.1834, radiusMeters: 1500 },
  { id: "federal-b-area", name: "Federal B Area", latitude: 24.9285, longitude: 67.0578, radiusMeters: 1400 },
  { id: "new-karachi", name: "New Karachi", latitude: 24.9686, longitude: 67.0631, radiusMeters: 1800 },
  { id: "baldia-town", name: "Baldia Town", latitude: 24.9107, longitude: 66.9520, radiusMeters: 2000 },
  { id: "keamari", name: "Keamari", latitude: 24.8459, longitude: 66.9799, radiusMeters: 1700 },
  { id: "bin-qasim", name: "Bin Qasim", latitude: 24.7677, longitude: 67.3439, radiusMeters: 2500 },
  { id: "surjani-town", name: "Surjani Town", latitude: 25.0139, longitude: 67.0508, radiusMeters: 2000 },
  { id: "model-colony", name: "Model Colony", latitude: 24.8987, longitude: 67.1517, radiusMeters: 1500 },
  { id: "liaquatabad", name: "Liaquatabad", latitude: 24.9084, longitude: 67.0512, radiusMeters: 1300 },
  { id: "korangi-industrial-area", name: "Korangi Industrial Area", latitude: 24.8235, longitude: 67.1122, radiusMeters: 1600 },
];

export function getAreaById(id: string): Area | undefined {
  return AREAS.find((a) => a.id === id);
}
