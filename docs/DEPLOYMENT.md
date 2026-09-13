# Deployment

## 1. GitHub

```bash
git init
git add .
git commit -m "Karachi Pulse MVP"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `.next`, `.env*`, and other build artifacts. Double-check `git status` shows no `.env` or `.env.local` before pushing.

## 2. Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repository.
2. Framework preset: **Next.js** (auto-detected).
3. Leave build command (`next build`) and output directory as default.
4. Deploy.

## 3. Environment Variables

In the Vercel dashboard:

```
Project -> Settings -> Environment Variables
```

Add:

| Name             | Value                        | Notes                                   |
|------------------|------------------------------|------------------------------------------|
| `GEMINI_API_KEY` | your Gemini API key          | Optional — app works without it (fallback engine) |
| `GEMINI_MODEL`   | e.g. `gemini-2.0-flash`      | Verify current free-tier model name before relying on it |

Apply to all environments you plan to use (Production/Preview/Development), then **redeploy** so the new variables take effect.

## 4. Testing production

After deploy:

- Load the live URL — confirm the map renders with seed data.
- Submit a test complaint end-to-end.
- Check `/api/weather` returns a 200 with either live or fallback weather.
- Check `/api/analyze` returns a valid `AIAnalysis` (with or without `GEMINI_API_KEY` set).
- Open on a phone-width viewport and confirm the bottom-sheet risk panel and modal work.

## 5. Common problems

- **Build fails on Google Fonts fetch**: this project loads fonts via a `<link>` tag in `app/layout.tsx` rather than `next/font/google`, specifically so the production build does not require outbound network access to `fonts.googleapis.com`. If you reintroduce `next/font/google`, make sure your build environment can reach Google's font CDN.
- **Map tiles don't load**: confirm outbound requests to `basemaps.cartocdn.com` aren't blocked by your network/firewall.
- **AI always falls back**: check `GEMINI_API_KEY` is set in the correct Vercel environment and that you redeployed after adding it.
- **Weather always shows "demo estimate"**: confirm outbound requests to `api.open-meteo.com` are not blocked.

## 6. API key configuration recap

- The Gemini key is read only in `lib/ai/gemini.ts` via `process.env.GEMINI_API_KEY`, called only from the server route `app/api/analyze/route.ts`. It is never sent to the browser bundle.
- Open-Meteo needs no key.
