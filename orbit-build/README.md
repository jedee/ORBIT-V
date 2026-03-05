# Orbit v2

> Daily rings for Nigeria. Your life, in motion.

A privacy-first, offline-capable PWA for tracking daily habits, finances, and growth — built in React, deployed via GitHub Actions.

---

## Local Development

```bash
git clone https://github.com/YOUR_USERNAME/orbit.git
cd orbit
npm install
npm run dev
# → http://localhost:5173/orbit/
```

---

## Deploying to GitHub Pages

### One-time setup (do this once per repo)

1. Push this repo to GitHub.

2. Go to **Settings → Pages**.

3. Under **Build and deployment**, select **Source: GitHub Actions**.

4. That's it. The workflow handles everything from here.

### Every deploy after that

Push to `main` — GitHub Actions will:
1. Install dependencies (cached after first run)
2. Run ESLint — if lint fails, nothing deploys
3. Run `vite build` — outputs to `./dist`
4. Deploy `./dist` to GitHub Pages

Your app will be live at:
```
https://YOUR_USERNAME.github.io/orbit/
```

---

## Base URL

The `base` in `vite.config.js` is set to `/orbit/` — matching the GitHub Pages repo path.

If you're deploying to a **custom domain** (e.g. `orbit.yourdomain.com`):
```js
// vite.config.js
base: '/',
```
And add your domain under **Settings → Pages → Custom domain**.

---

## Project Structure

```
orbit/
├── .github/
│   └── workflows/
│       ├── deploy.yml       ← main deploy pipeline
│       └── pr-check.yml     ← lint + build check on PRs
├── public/
│   └── icon.svg
├── src/
│   ├── App.jsx              ← entire Orbit app
│   ├── main.jsx             ← React entry point
│   └── index.css            ← global reset + animations
├── index.html               ← Vite entry HTML
├── vite.config.js           ← build config + PWA plugin
└── package.json
```

---

## Live Friends (Firebase)

The friends leaderboard currently uses demo data. To enable live sync:

1. Create a free [Firebase](https://firebase.google.com) project.
2. Enable **Firestore** and **Anonymous Authentication**.
3. In `src/App.jsx`, replace `MOCK_FRIENDS` loading logic with Firestore reads.
4. Store user documents at `users/{orbitId}` with fields: `{name, streak, totalPerfect, todayPct, focus}`.
5. Friends collection: `friends/{userId}/list/{friendId}`.

Friends only ever see rings, streak, and level — never income or spending data.

---

## Tax Disclaimer

Tax calculations use PITA Cap P8 LFN 2004 (as amended by Finance Acts 2019/2020), PRA 2014, and NHF Act Cap N45 LFN 2004. These are estimates for planning purposes. Consult a tax professional for filing.

---

## Philosophy

Orbit shows. You decide. No scores, no nudges, no algorithms. Just clarity.
