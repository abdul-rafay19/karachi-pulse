# Karachi Pulse — Context Handover

This file exists so a fresh AI session (or a new developer) can pick up this project with zero prior context. Read this fully before making changes.

## Update — map fix + Civic Assistant chatbot (latest session)

Two things changed since the "Complete and working" list below was first written:

1. **Map no longer shows "API key required".** CARTO gated their free `dark_all` tile set behind an API key after this project was first built. Fixed by switching `components/map/KarachiMap.tsx` to plain, permanently-keyless OpenStreetMap raster tiles (`{s}.tile.openstreetmap.org`) and recreating the dark aesthetic with a CSS `filter` (invert + hue-rotate + brightness/contrast/saturation) on a `.kp-tile-dark` class, defined in `app/globals.css`. No key, no billing, nothing to break mid-demo.
2. **New: a real, data-grounded civic assistant chatbot** — not a toy FAQ bot. New files:
   - `lib/ai/chatClient.ts` — provider-agnostic OpenAI-compatible client. Works with Groq (default), OpenRouter, or NVIDIA NIM by swapping three env vars (`CHAT_PROVIDER_BASE_URL`, `CHAT_PROVIDER_API_KEY`, `CHAT_PROVIDER_MODEL`) — no code change, no SDK dependency (plain `fetch`).
   - `lib/ai/chatPrompt.ts` — compresses the live `areaStates`/`metrics`/`weather` the client already has into a compact JSON block embedded in the system prompt, so the model answers from real current numbers instead of hallucinating.
   - `lib/ai/chatTools.ts` — three tool/function definitions (`fly_to_area`, `open_report_form`, `open_authorities`) so the assistant can drive the UI, not just describe it.
   - `lib/ai/chatProvider.ts` — orchestration: calls the LLM with tools, executes any tool call (validated against live area data so it can't hallucinate an area id), asks for a short follow-up reply, and always degrades gracefully.
   - `lib/ai/chatFallback.ts` — same "never go silent" philosophy as `lib/ai/fallback.ts` for complaints: if no `CHAT_PROVIDER_API_KEY` is set, a rule-based engine still answers "is it safe in X" directly from live data and still fires real UI actions. Try it with zero env vars configured — it works out of the box.
   - `app/api/chat/route.ts` — the server route; keys stay server-side, same pattern as `/api/analyze`.
   - `components/chat/ChatWidget.tsx` + `components/chat/ChatMessage.tsx` — floating assistant UI, wired into `app/page.tsx`, which executes returned actions (fly the map, open the report form, scroll to authorities).
   - `types/index.ts` gained `ChatTurn`, `ChatAction`, `ChatResponse`.

See the updated `.env.example` for the exact env vars and provider swap instructions.

## Project identity

**Karachi Pulse** — "See the risk. Understand the problem. Act early." An AI-powered citizen complaint and area-risk monitoring system for Karachi, Pakistan. Hackathon MVP.

## Vision

A citizen reports a problem -> Karachi Pulse understands it (AI) -> detects whether it's becoming an area-level risk (deterministic engine) -> combines it with weather -> visualizes it on a live Karachi map -> explains what's happening in plain English -> tells citizens what they can do and which authority to contact. Every feature should serve this loop; anything that doesn't is lower priority.

## Current status (as of this handover)

**Complete and working:**
- Full Next.js 16 (App Router) + TypeScript + Tailwind 4 project at the repo root
- Type system (`types/index.ts`)
- Karachi area data (24 real localities) and authority mapping (`data/areas.ts`, `data/authorities.ts`)
- Deterministic seed dataset, ~56 complaints across 5 demo scenarios, timestamped relative to `Date.now()` (`data/complaints.ts`)
- Geo utilities: Haversine distance + nearest-area lookup (`lib/geo/distance.ts`)
- Full deterministic risk engine (`lib/risk/*`) — see `docs/RISK_ENGINE.md`
- Weather layer: Open-Meteo client + deterministic fallback (`lib/weather/*`)
- AI layer: Gemini provider with structured JSON output, deterministic keyword-rule fallback, orchestration (`lib/ai/*`)
- Server API routes `/api/analyze` and `/api/weather` — key stays server-side
- `localStorage`-backed `ComplaintRepository` with get/add/update/delete/clear (`lib/storage/complaintRepository.ts`) + weather cache (`lib/storage/weatherCache.ts`)
- Central client hook `useKarachiPulse` (`lib/state/useKarachiPulse.ts`) wiring complaints, area states, weather, filters, submit, reset
- Full UI: Header, Hero (with inline live map), map components (KarachiMap, RiskZone, ComplaintMarker, MapLegend), complaint flow (CategorySelector, ComplaintForm, ComplaintProcessing/Success), risk panel (RiskScoreDisplay, RiskBreakdown, RiskTrendChart, RiskFactors, RiskPanel), WeatherCard, AuthorityCard/AuthorityDirectory, dashboard (MetricCard, LiveStatus, DashboardSummary, FiltersBar, RiskInsightsList), Footer with demo reset, Modal + Drawer primitives
- `app/page.tsx` wires everything together
- `npm run build` and `npm run lint` both pass cleanly
- Smoke-tested: homepage renders (200), `/api/weather` and `/api/analyze` both return correct fallback responses when there's no network/API key (verifying the "never crash" requirement)
- Docs: `README.md`, `docs/ARCHITECTURE.md`, `docs/RISK_ENGINE.md`, `docs/DEMO_SCRIPT.md`, `docs/DEPLOYMENT.md`, this file, `.env.example`, `.gitignore`, `LICENSE`

**Known limitations / not yet done:**
- No automated test suite (Section 98/99 of the original brief describes manual QA checklist items — these have been spot-checked, not scripted)
- Image uploads are local-preview only (no AI image analysis) — this matches the brief's "nice to have" priority
- Area-level AI summaries intentionally use a deterministic template (`lib/risk/areaSummary.ts`) rather than a live Gemini call, to avoid burning API quota recalculating 24 areas on every complaint — see "Important decisions" below
- Weather is fetched once for Karachi's center and applied city-wide, not per-area — reasonable for an MVP, a documented simplification
- No production deployment has been performed by this session (no live Vercel URL) — see `docs/DEPLOYMENT.md` to do this

## Architecture

See `docs/ARCHITECTURE.md` for the full diagram and explanation. One-line summary: UI components are presentation-only; `useKarachiPulse` is the single client-side data owner; `/api/analyze` and `/api/weather` are the only places that touch secrets or external APIs; `lib/risk/*` is pure and deterministic; `lib/storage/*` is the only code that touches `localStorage`.

## Tech stack

- next 16.x, react 19.x, typescript, tailwindcss 4
- leaflet + react-leaflet (map)
- lucide-react (icons)
- @google/generative-ai (Gemini SDK)
- No database, no auth, no state management library beyond React state/hooks

## Data model

See `types/index.ts` for the authoritative definitions: `Complaint`, `AIAnalysis`, `RiskBreakdown`, `RiskScore`, `Area`, `AreaState`, `WeatherSnapshot`, `Authority`, `DashboardMetrics`, plus the filter unions.

## Risk engine

Formula, weights, and rationale fully documented in `docs/RISK_ENGINE.md`. Entry point: `calculateAreaRisk(complaints, weather, now?)` in `lib/risk/calculateRisk.ts`.

## AI architecture

- Provider: Google Gemini, model name from `GEMINI_MODEL` env var (default `gemini-2.0-flash` — **verify this is still a valid free-tier model name before a real demo**, Google renames/deprecates these periodically)
- Prompts: `lib/ai/prompts.ts`
- Schema + validation: `lib/ai/schemas.ts` (`validateAIAnalysis` is the safety net both Gemini and fallback outputs pass through)
- Fallback: `lib/ai/fallback.ts` — pure keyword rules, always available
- Orchestration: `lib/ai/provider.ts` — `analyzeComplaint()` is what callers use

## Weather architecture

- `lib/weather/openMeteo.ts` — `fetchOpenMeteo({ latitude, longitude })`, no API key, 10-minute revalidation
- `fallbackWeather()` — deterministic demo snapshot (light rain, 55% probability) used on any fetch failure
- Karachi center coordinates: `data/areas.ts` -> `KARACHI_CENTER` (24.8607, 67.0011)

## Map architecture

- `react-leaflet` `MapContainer` + CARTO dark tile layer (`basemaps.cartocdn.com/dark_all`) — chosen over stock OSM tiles to match the dark UI; still OSM data underneath, attribution included and required
- Area risk: `Circle` overlays, colored via `lib/ui/riskColors.ts`
- Complaints: custom `L.divIcon` markers (no default Leaflet marker image assets, avoids a common bundler issue), colored via `lib/ui/categoryMeta.tsx`

## Seed data

`data/complaints.ts` — `ALL_SPECS` is a fixed array of `{areaId, category, description, severity, hoursAgo, jitterIndex}`. `generateSeedComplaints(now)` converts `hoursAgo` into absolute ISO timestamps relative to whatever `now` is passed (defaults to `Date.now()`), so the demo always looks fresh. The underlying spec list itself never changes — only the resulting timestamps shift. `jitterIndex` picks from a small fixed set of lat/lng offsets so complaints don't all stack on the exact area centroid.

## Storage

`lib/storage/complaintRepository.ts`. Key: `karachi-pulse:complaints:v1`. Re-seeds automatically if the stored seed stamp (`karachi-pulse:seed-stamp:v1`) is older than 12 hours, while preserving any `source: "citizen"` complaints. `clearComplaints()` is the "Reset demo data" button's handler (in `Footer.tsx`, requires a confirm click).

## Environment variables

```
GEMINI_API_KEY   # optional
GEMINI_MODEL     # optional, defaults to gemini-2.0-flash in code
```

Never put actual key values in this file or in git.

## Important decisions (and why)

- **No database.** Hackathon time constraint; `ComplaintRepository` isolates this decision so it's a one-file change later.
- **AI never sets the final risk score.** Keeps the score explainable/defensible and immune to prompt-injection-style manipulation via complaint text.
- **Area summaries are template-based, not a live Gemini call.** Recalculating 24 areas' summaries on every single complaint submission would multiply API calls for little added value, since the underlying facts (category mix/trend/rain) already drive a good plain-English summary. `generateAreaSummary` in `lib/ai/provider.ts` exists and *can* call Gemini for this if wanted later, but the client hook currently uses the pure `buildAreaSummary` template directly.
- **Fonts loaded via `<link>` tag, not `next/font/google`.** The sandbox this was built in has no outbound access to `fonts.googleapis.com` at build time; `next/font/google` fetches fonts during the build and fails hard without network access. A runtime `<link>` tag sidesteps this and still works identically once deployed (browsers fetch it at request time, not build time).
- **Single city-wide weather reading.** Open-Meteo's free tier and Karachi's geographic scale make one reading a reasonable simplification for an MVP; documented as a known limitation above.
- **CARTO dark tiles instead of stock OSM raster tiles.** Matches the dark civic-dashboard aesthetic; still requires (and includes) OpenStreetMap attribution.

## Known bugs

None currently known. `npm run build` and `npm run lint` are clean (one harmless `@next/next/no-page-custom-font` warning, which is an expected false positive for App Router — see `docs/DEPLOYMENT.md`).

## Next steps (ordered)

1. Deploy to Vercel (`docs/DEPLOYMENT.md`) and get a live URL for the demo.
2. Verify the current Gemini free-tier model name is still `gemini-2.0-flash` (or update `GEMINI_MODEL`) shortly before presenting.
3. Optional polish: micro-animations on risk score changes, skeleton loading state for the map tile layer, mobile Lighthouse pass.
4. Optional: wire `generateAreaSummary`'s Gemini path into the UI for a "regenerate AI summary" button on the risk panel, if API quota allows.
5. Optional: add a lightweight test file for `calculateAreaRisk` covering the scenarios in the original brief's Section 98 (zero complaints, one low complaint, multiple high complaints, heavy rain, no rain, increasing trend).

## Demo flow

See `docs/DEMO_SCRIPT.md` for the full 3-minute and 5-minute scripts, expected risk values per area, and the backup plan if Gemini/Open-Meteo are unreachable during the live demo.

## Presentation story

"Many systems collect complaints. Karachi Pulse converts individual complaints into actionable, area-level intelligence — combining reports with weather to produce an explainable, early-warning risk signal, not a black-box prediction." Language to use: risk, likelihood, emerging risk, potential impact. Language to avoid: guaranteed flooding/outage, disaster will happen.

## Files (quick index)

| Path | Purpose |
|---|---|
| `app/page.tsx` | Main app shell, wires `useKarachiPulse` into all sections |
| `app/api/analyze/route.ts` | Server route: complaint -> AI analysis |
| `app/api/weather/route.ts` | Server route: Open-Meteo proxy + fallback |
| `lib/state/useKarachiPulse.ts` | Central client data hook |
| `lib/risk/calculateRisk.ts` | Risk engine entry point |
| `lib/ai/provider.ts` | AI orchestration (Gemini -> fallback) |
| `lib/storage/complaintRepository.ts` | localStorage data access |
| `data/complaints.ts` | Synthetic seed dataset |
| `data/areas.ts` | Karachi area coordinates |
| `data/authorities.ts` | Category -> civic authority mapping |

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (must pass before shipping)
npm run start    # run the production build locally
npm run lint     # ESLint
```
