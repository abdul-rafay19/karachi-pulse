# Risk Engine

The final Area Risk Score is **always computed deterministically** by `lib/risk/calculateRisk.ts`. AI only supplies per-complaint signals (category, severity, urgency) — it never sets the score directly.

## Formula

```
Risk Score =
    Volume                x 0.25
  + Severity               x 0.25
  + Urgency                x 0.15
  + Recency                x 0.15
  + Category Hazard        x 0.10
  + Weather Amplification  x 0.10
```

All six components are normalized to 0-100 before weighting. The weighted sum is clamped to 0-100 and rounded.

## Classification

| Range  | Level    | Color  |
|--------|----------|--------|
| 0-39   | Low      | Green  |
| 40-74  | Moderate | Amber  |
| 75-100 | Critical | Red    |

## Components

### Volume score
`1 - e^(-count / 3)`, scaled to 0-100. Capped/logarithmic growth: 1 complaint contributes modestly (~28), 3 complaints ~63, 6+ complaints ~87+. Prevents a single burst of reports from instantly maxing out an area.

### Severity score
`0.55 x mean(severity) + 0.45 x max(severity)` across the area's complaints, where each complaint's `severity` (0-100) already blends the citizen's selected severity with the AI's independent estimate. Weighting in the max keeps one genuinely critical report from being diluted by several low-severity ones, without letting it fully dominate.

### Urgency score
Same shape as severity (`0.6 x mean + 0.4 x max`), using each complaint's AI-estimated urgency (0-100).

### Recency score
Each complaint gets a time-decay weight `e^(-ageHours / 36)`. The area's recency score is `0.5 x mean(weight) + 0.5 x max(weight)`, scaled to 0-100. Reports from the last few hours weigh far more than reports from days ago.

### Category hazard score
A fixed intrinsic hazard baseline per category (flooding 90, sewage 85, electricity 70, water 60, roads 55, waste 50, other 40), weighted by how many of the area's complaints fall in each category. Reflects that a flooding-dominated area is inherently riskier than a waste-dominated one at the same complaint count.

### Weather amplification score
`baseWeatherRisk(precipitationMm, probability) x relevanceFactor`, where:
- `baseWeatherRisk` bands raw rainfall into 0-100 (no rain = 0; light 10-20; moderate 25-40; heavy 50-70; extreme 70-100), scaled down when the forecast probability is low.
- `relevanceFactor = 0.15 + 0.85 x (share of the area's complaints in weather-sensitive categories: flooding, sewage, roads, electricity, water)`. An area with only waste complaints barely moves on a rain forecast; a drainage-heavy area moves a lot.

## Trend (display-only, not weighted into the score)

`calculateTrend` compares complaint counts in the last 24h against the 24h window before that. A >=15% increase is "increasing", a >=15% decrease is "improving", otherwise "stable". This drives the trend arrow shown in the UI and one of the "why this risk" factors — it is intentionally a separate, simple signal rather than a forecast.

## Why this is deterministic

Every input to `calculateAreaRisk` is plain data (complaints + one weather snapshot). No randomness, no AI call, no wall-clock dependency beyond an explicit `now` parameter (which defaults to `Date.now()` but can be pinned in tests). The same complaint set and weather reading always produce the same score — this is what makes the score explainable and demo-safe.

## Where it lives

- `lib/risk/riskTypes.ts` — weights, category hazard baselines, `clamp()`
- `lib/risk/calculateTrend.ts`
- `lib/risk/calculateWeatherAmplification.ts`
- `lib/risk/calculateRisk.ts` — the entry point, `calculateAreaRisk()`
