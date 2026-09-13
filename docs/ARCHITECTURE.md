# Architecture

## Layers

```
Frontend (Next.js App Router, client components)
  |
  |-- useKarachiPulse (lib/state) — single source of truth on the client
  |
  v
API routes (app/api) — server-only, hold the Gemini key
  |
  |-- /api/analyze  -> lib/ai/provider -> gemini.ts | fallback.ts
  |-- /api/weather  -> lib/weather/openMeteo.ts (+ fallback)
  |
  v
Risk engine (lib/risk) — pure, deterministic, no I/O
  |
  v
Storage (lib/storage) — localStorage, behind ComplaintRepository
```

## Frontend

`app/page.tsx` is a client component that renders `Header`, `Hero` (with the map inlined), the live map section, risk insights, authorities, and the footer. It gets all of its data from `useKarachiPulse()`.

`useKarachiPulse` (`lib/state/useKarachiPulse.ts`) is the only place that:
- loads complaints from `ComplaintRepository` on mount
- fetches weather from `/api/weather`
- recomputes every area's `RiskScore` via `calculateAreaRisk` whenever complaints or weather change
- exposes filters, area selection, `submitComplaint`, and `resetDemo`

Components are presentation-only and receive everything via props — no component reaches into `localStorage` or calls `fetch` directly except the hook and the complaint form's submit handler.

## API

Two server routes, both small and defensive:

- `POST /api/analyze` — validates the request body, calls `analyzeComplaint()` from `lib/ai/provider.ts`, always returns `{ analysis, degraded, message? }`. Never returns a bare error for a valid request.
- `GET /api/weather` — calls Open-Meteo, falls back to a labeled demo snapshot on any failure. Always returns `{ weather, degraded, message? }`.

The Gemini API key only ever exists in these server routes' process environment — it is never sent to the browser.

## AI

```
lib/ai/
  schemas.ts   JSON schema + validateAIAnalysis() — coerces any input into a safe AIAnalysis
  prompts.ts   System + user prompt builders
  gemini.ts    Calls @google/generative-ai with responseMimeType: "application/json"
  fallback.ts  Deterministic keyword-rule analysis, same output shape
  provider.ts  Orchestrates: no key -> fallback; key + call fails -> fallback; else Gemini
```

`validateAIAnalysis` is the single choke point both paths go through, so a malformed Gemini response and the fallback path both produce an identical, safe shape.

## Risk Engine

```
lib/risk/
  riskTypes.ts                     Category hazard baselines, weights, clamp()
  calculateTrend.ts                24h vs previous-24h comparison
  calculateWeatherAmplification.ts Rain -> risk points, scaled by category relevance
  calculateRisk.ts                 Combines everything into the final RiskScore
  areaSummary.ts                   Pure template summary (no AI call)
```

This layer takes only plain data in and returns plain data out — no fetch, no localStorage, no React. That's what makes it unit-testable and demo-safe: the same complaint set always produces the same score.

## Weather

```
lib/weather/
  openMeteo.ts   fetchOpenMeteo() + fallbackWeather()
  weatherRisk.ts Re-exports the amplification function so weather-specific code
                 has one obvious home
```

A single Karachi-wide weather snapshot is used for every area's amplification score — realistic for a city-scale MVP, since Open-Meteo's free tier is most reliable at this granularity.

## Storage

```
lib/storage/
  complaintRepository.ts  getComplaints/addComplaint/updateComplaint/deleteComplaint/clearComplaints
  weatherCache.ts          Last-known-good weather snapshot, for offline-ish resilience
```

`ComplaintRepository` is the only file that touches `window.localStorage`. Swapping to a real database later means rewriting this file's internals only — every caller already works against the same five-method interface.

## Map

React Leaflet + a CARTO dark basemap (OpenStreetMap data, attribution included). Area risk is drawn as `Circle` overlays colored by risk level; individual complaints are custom `divIcon` markers colored by category. No default Leaflet marker images are used, avoiding the usual bundler asset-path issue.
