# Demo Script

## 3-minute demo

1. **Open the app.** The hero loads with the live status bar and a populated Karachi map — greens, ambers, and one or two reds already visible. Say: *"Karachi Pulse turns individual citizen complaints into area-level intelligence."*
2. **Click Korangi** (red zone, southeast Karachi). The risk panel slides in showing **~85-90/100, Critical**, trend "Increasing".
3. Point out the **Main issues** chips (Drainage/Flooding, Sewage), the **Risk breakdown** bars, and the **Weather card** (rain expected, "+X risk points").
4. Read the **"Why this risk?"** factors aloud — they're generated from the actual data, not hard-coded.
5. Click **Report an Issue**. Pick Korangi, category "Drainage / Flooding", type: *"Water is collecting outside the main road and the drain appears blocked."* Submit.
6. Show the **processing animation** (Identifying issue → Estimating severity → Checking area activity → Evaluating weather → Updating area risk), then the **success card** with the AI's category/severity/summary.
7. Close the modal — the map, the metrics row, and Korangi's score have all updated live, no refresh.
8. Close with: *"One complaint may be isolated. But when multiple drainage, sewage, and waterlogging complaints appear in the same area, combined with expected rainfall, Karachi Pulse detects an emerging risk — and tells citizens what to do about it."*

## 5-minute demo (adds)

9. Scroll to **Risk Insights** — show the ranked area cards, click a moderate one (Gulshan-e-Iqbal) to show the waste-driven, increasing-trend scenario for contrast.
10. Scroll to **Authorities** — show the category -> department mapping and explain Karachi Pulse links out rather than pretending to submit on the citizen's behalf.
11. Use the **search bar** to fly to "Clifton" and show the low-risk scenario (few, old, low-severity reports) for contrast against Korangi.
12. Mention the **filters** (category / risk level) and demonstrate filtering the map to "Critical" only.
13. Briefly show `docs/RISK_ENGINE.md` or the risk breakdown bars again and state the formula out loud — judges respond well to the engine being explainable, not a black box.

## Expected values (approximate, will drift slightly with real-time weather/decay)

- Korangi: ~80-90, Critical, Increasing
- Landhi: ~55-70, Moderate/Critical depending on weather
- Gulshan-e-Iqbal: ~45-60, Moderate, Increasing
- Nazimabad: ~45-60, Moderate
- Clifton: ~10-25, Low, Stable

## Backup plan if APIs fail

- **Gemini unavailable / no key**: the complaint form still works end-to-end. The success card shows an amber notice ("AI analysis is running on the platform's local analysis engine") and a still-sensible category/severity/summary from the deterministic fallback. Say: *"Even without live AI, the pipeline degrades gracefully rather than breaking."*
- **Open-Meteo unavailable**: the weather card shows a "demo estimate" badge and the map shows a small "Weather running on demo estimate" pill. The risk engine still runs — nothing crashes.
- **No internet at all during the demo**: seed data, the map, and the risk engine work entirely offline once the page has loaded once (Leaflet tiles will not load without internet, but risk zones, scores, and the complaint flow still function).
