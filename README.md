# NutriVision AI

Photograph a meal, get calories and nutrition back. Built for Indian food, where most trackers guess badly at dal, sabzi and thali portions.

Tracks seven nutrients against personalised daily targets: calories, protein, carbs, fat, fiber, calcium and vitamin B12. Available in English and Hindi.

---

## Features

**Photo analysis** — Point the camera at a plate. Claude identifies each item, estimates portion weight, and returns a full nutrient breakdown. Every value is editable before you log it, with a ×0.5 / ×1 / ×1.5 / ×2 portion stepper.

**Typo-tolerant text entry** — Type "chiken tika" or "tuwar daal" and it finds the right food from a 92-item Indian database without an API call. Falls through to AI estimation for anything not listed.

**Today dashboard** — A ring showing percentage of your daily calorie goal, macro and micronutrient rings, and a completion panel listing all seven nutrients as percentages against target.

**Meal plan** — Reads what you're still short on and ranks foods that close those gaps, filtered by diet (vegetarian, eggetarian, non-veg, mixed). Build a basket to preview the combined effect, then log it.

**History** — Real logged data, not samples. Diverging bar chart of daily deficit and surplus over 7, 14 or 30 days, with averages, days on target, and a day-by-day breakdown.

**Weekly summary** — Averages for each nutrient, how many days you hit each target, and week-over-week trend arrows.

**Water, weight, recents** — Eight-glass daily water tracker, weight log with trend line, and a quick-add row of recently logged foods.

**Guides** — Exercise routines, healthy Indian foods organised by nutrient with per-serving amounts, what to limit, and separate advice for losing, gaining and maintaining weight.

**CSV export** — Sixteen columns of intake, goals, water and weight.

**Installable PWA** — Works offline for everything except AI analysis.

---

## Safety behaviour

The app refuses to generate targets in three cases, showing an explanation and pointing to a clinician instead:

- Age under 18
- BMI below 16
- BMI below 18.5 combined with a weight-loss goal

Calorie targets are also floored at BMR, so an aggressive deficit can't drop below the level needed for basic organ function.

This matters because calorie trackers are known to worsen disordered eating, and the people most at risk are the ones most likely to use them heavily. If you fork this, please keep these checks.

---

## Quick start

```bash
git clone https://github.com/YOUR_USERNAME/nutrivision-ai.git
cd nutrivision-ai
npm install
```

Get an API key from [console.anthropic.com](https://console.anthropic.com/settings/keys), then:

```bash
cp .env.example .env.local
# edit .env.local and paste your key
```

The app needs both the frontend and the serverless function running:

```bash
# terminal 1
vercel dev      # serves /api/analyze on port 3000

# terminal 2
npm run dev     # serves the app on port 5173
```

Open http://localhost:5173.

Without the Vercel CLI, `npm run dev` alone still loads everything — photo and text analysis will fail, but the rest works.

---

## Deploying

### Vercel

```bash
npm i -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` under Settings → Environment Variables, then redeploy. The `api/` folder becomes a serverless function automatically.

### Netlify

Replace `api/analyze.js` with `api/analyze.netlify.js` (Netlify uses a different function signature), then:

```bash
npm i -g netlify-cli
netlify deploy --prod
```

Add `ANTHROPIC_API_KEY` under Site settings → Environment variables.

### GitHub Pages — not suitable

Pages serves static files only, so there's nowhere to run the proxy. The only way to make it work would be putting your API key in the browser bundle, where anyone can read it. Use Vercel or Netlify; both have free tiers.

---

## How the API key is protected

The browser never sees it. Requests go to `/api/analyze`, a serverless function that attaches the key server-side and forwards to Anthropic.

A key in frontend code is visible in DevTools to every visitor, and leaked keys get scraped and drained quickly. `.env.local` is gitignored, and CI fails the build if an `.env` file is ever committed.

The proxy caps request size at 5 MB, caps `max_tokens` at 2000, and rate-limits per IP.

### The rate limiter is a speed bump, not a wall

It holds state in memory on a single serverless instance. Instances are ephemeral and run in parallel, so a determined caller routes around it. Before sharing a public URL:

- Set a **spend cap in the Anthropic console** — this is what actually bounds your exposure
- Add Upstash Redis for distributed rate limiting, or put the app behind a login

A public endpoint calling a paid API on demand is how people end up with surprising bills.

---

## Data and privacy

Everything is stored on the user's device — profile, meals, history, weight, water. Nothing is uploaded. Only the food photo or text description goes to the API for analysis.

If you add accounts and sync, you're then storing health data on a server, which brings real obligations. Under India's DPDP Act that includes consent, purpose limitation, and breach notification. Worth doing properly or not at all.

---

## Structure

```
├── api/
│   ├── analyze.js           Serverless proxy (Vercel) — holds the API key
│   └── analyze.netlify.js   Same logic, Netlify signature
├── src/
│   ├── NutriVisionAI.jsx    The app
│   ├── InstallPrompt.jsx    PWA install prompt + update banner
│   └── main.jsx             Entry point, service worker registration
├── public/
│   ├── sw.js                Service worker
│   ├── offline.html         Offline fallback
│   ├── manifest.webmanifest PWA manifest
│   └── icon-*.png           Icon set
├── vercel.json / netlify.toml
└── .env.example
```

`NutriVisionAI.jsx` is a single 3,300-line file. That was fine while building but is past the point where it should be split — `components/`, `data/` for the food database and guides, and `i18n/` for the string tables are the natural cuts.

---

## Accuracy, honestly

Portion estimation from a photo is approximate. Two things it handles poorly:

**Cooking oil.** Invisible in an image, and it swings a dish by 100+ kcal. A restaurant gravy might carry three tablespoons you'd never guess from looking.

**Depth.** A photo flattens the bowl. Judging how much dal is in it is genuinely hard, and estimates can be off by a third either way.

Single unmixed foods come back close. Mixed plates drift. Database values are averages for typical home cooking, and oil use varies enormously between kitchens.

Treat the numbers as a starting point and correct them. Consistent slight error still shows real trends over weeks, which is what matters.

---

## Known limitations

- Guide content is English-only; the Hindi build translates the interface and food names but not the ~200 lines of health guidance, which should be reviewed by a native speaker before translating
- AI responses come back in English regardless of interface language
- Logged foods use a nominal 100g weight, so the gram figure in the meal log isn't meaningful for count-based servings like "2 rotis"
- Device-local storage only — clearing browser data loses everything, so export periodically

---

## Health information

Targets come from standard formulas (Mifflin-St Jeor for BMR, WHO and ICMR reference intakes). This is not medical advice.

Talk to a doctor or registered dietitian before following any of it if you're pregnant or breastfeeding, managing diabetes, thyroid, kidney or heart conditions, taking medication affected by diet, or have any history of disordered eating.

Note also that BMI thresholds here follow WHO cut-offs. Indian and other South Asian populations carry higher cardiometabolic risk at the same BMI, and Indian guidelines commonly use lower thresholds — overweight from 23, obese from 25.

## License

MIT
