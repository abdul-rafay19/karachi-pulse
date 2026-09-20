# Karachi Pulse

**See the risk. Understand the problem. Act early.**

An AI-powered live risk map for Karachi that turns citizen complaints and weather signals into actionable, area-level risk intelligence.

> Demo mode: the map ships with a synthetic Karachi incident dataset so it looks alive immediately. It is not real government data — see [Demo Data](#demo-data) below.

## Overview

A citizen reports a problem → Karachi Pulse understands it (AI) → detects whether it's becoming an area-level risk (deterministic risk engine) → combines it with weather → visualizes it on a live Karachi map → explains what's happening → tells citizens what they can do, and who to report it to.

## Features

- **Live risk map** of Karachi (Leaflet + OpenStreetMap/CARTO tiles) with color-coded area risk zones (green/amber/red) and individual complaint markers
- **Citizen complaint form** with category, severity, description, optional photo preview, and area selection
- **AI complaint analysis** (Google Gemini, structured JSON output) with a deterministic keyword-rule fallback — the app never breaks without an API key
- **Deterministic, explainable risk engine** — the AI never sets the final score directly
- **Weather-aware risk amplification** via Open-Meteo (no API key required)
- **Area risk detail panel**: score, trend, breakdown, weather, "why this risk", recommendations, safety precautions, recent reports, relevant authority
- **Authority directory** pointing to the right official channel per category (K-Electric, KWSC, KMC, Sindh Solid Waste Board) — never fakes a submission
- **Dashboard metrics, filters, and area search**
- **No database required** — seed data + citizen reports live in `localStorage`, behind a repository interface that can be swapped for a real API/DB later

## Architecture

```
Citizen complaint
   -> AI understanding (Gemini or fallback)
   -> structured signals (category, severity, urgency, keywords)
   -> deterministic risk engine (volume, severity, urgency, recency, category hazard, weather)
   -> weather amplification (Open-Meteo)
   -> final risk score (0-100)
   -> map visualization (green / amber / red)
   -> area risk panel (explanation, recommendations, authority)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full breakdown and [`docs/CONTEXT_HANDOVER.md`](docs/CONTEXT_HANDOVER.md) for a complete project handover document.

## Tech Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- React Leaflet / Leaflet + OpenStreetMap-compatible tiles (CARTO dark basemap)
- Google Gemini API (`@google/generative-ai`) — free tier, server-side only
- Open-Meteo — free, no API key
- `localStorage` for persistence (no database)
- Lucide icons

## AI Pipeline

See [`docs/RISK_ENGINE.md`](docs/RISK_ENGINE.md) and [`lib/ai/`](lib/ai/). In short: Gemini is asked for structured JSON signals only (category, severity, urgency, keywords, summary, impacts, actions, precautions) via `lib/ai/gemini.ts`. If Gemini is unconfigured, fails, or returns malformed JSON, `lib/ai/fallback.ts` computes the same shape deterministically from keyword rules. `lib/ai/provider.ts` orchestrates the two so callers always get a valid `AIAnalysis`.

## Risk Engine

Fully documented in [`docs/RISK_ENGINE.md`](docs/RISK_ENGINE.md). Weighted formula:

```
Risk Score = Volume x 0.25 + Severity x 0.25 + Urgency x 0.15
           + Recency x 0.15 + CategoryHazard x 0.10 + WeatherAmplification x 0.10
```

0-39 Low · 40-74 Moderate · 75-100 Critical.

## Weather Integration

`lib/weather/openMeteo.ts` calls Open-Meteo for Karachi's coordinates (no API key). If the request fails, `/api/weather` returns a clearly-labeled deterministic demo estimate instead of erroring.

## Demo Data

`data/complaints.ts` generates ~56 synthetic complaints spread across 24 real Karachi localities, built around five demo scenarios (Korangi flooding, Landhi electricity, Gulshan-e-Iqbal waste, Nazimabad roads, Clifton low-risk). Timestamps are generated relative to "now" so recency/trend calculations always look fresh, no matter when the demo runs. This is clearly synthetic data, not verified government records.

## Local Development

```bash
npm install
cp .env.example .env.local   # optional — the app works without a Gemini key
npm run dev
```

Open http://localhost:3000.

## Environment Variables

See [`.env.example`](.env.example):

```env
GEMINI_API_KEY=      # optional — omit to run entirely on the deterministic fallback engine
GEMINI_MODEL=gemini-2.0-flash
```

Never commit `.env` or `.env.local`.

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full Vercel walkthrough.

```bash
npm run build   # verify production build before shipping
```

## Project Structure

```
app/                 Next.js routes, layout, and the two API routes (analyze, weather)
components/          UI components (map, complaint, risk, weather, dashboard, authority, ui)
data/                Karachi areas, authorities, synthetic complaint seed data
lib/ai/              Gemini provider, deterministic fallback, prompts, schemas
lib/risk/            Deterministic risk engine (volume/severity/urgency/recency/hazard/weather)
lib/weather/         Open-Meteo client + weather-risk transform
lib/storage/         localStorage-backed complaint repository + weather cache
lib/state/           useKarachiPulse — the single client hook wiring everything together
types/               Shared TypeScript interfaces
docs/                Architecture, risk engine, demo script, deployment, context handover
```

## Future Improvements

- Real database (PostgreSQL/Supabase) behind the existing `ComplaintRepository` interface
- Verified government/authority data feeds
- Authentication and authority response tracking
- Push notifications / SMS / WhatsApp alerts
- Real-time WebSocket updates
- Image-based AI analysis of uploaded photos
- Proper geospatial clustering (beyond nearest-area lookup)
- Urdu / Sindhi localization
- Historical analytics and ML-based forecasting

## Team

Built as a hackathon MVP for Karachi Pulse..

---

*Risk estimates are informational and based on available reports and weather data. They should not replace official emergency guidance.*
