# Orbit CI/CD Pipeline

A production-grade deployment system. Every workflow has a specific job, and they compose into a full pipeline.

---

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GIT EVENTS                                  │
├────────────────┬──────────────┬────────────┬────────────────────┤
│ push → main    │ push →       │ pull_      │ push tag v*.*.*    │
│                │ staging      │ request    │                    │
└───────┬────────┴──────┬───────┴─────┬──────┴──────┬────────────┘
        │               │             │              │
        ▼               ▼             ▼              ▼
┌───────────────┐ ┌──────────┐ ┌──────────┐  ┌──────────────────┐
│ deploy-       │ │ deploy-  │ │ pr-      │  │ docker.yml       │
│ production    │ │ staging  │ │ preview  │  │                  │
│ .yml          │ │ .yml     │ │ .yml     │  │ Build + push to  │
│               │ │          │ │          │  │ GHCR             │
│ Lint → build  │ │ Lint +   │ │ Lint +   │  │ Multi-platform   │
│ across 3 node │ │ build →  │ │ build →  │  │ arm64 + amd64    │
│ versions →    │ │ surge.sh │ │ unique   │  │ Trivy scan       │
│ GitHub Pages  │ │ staging  │ │ PR URL   │  │                  │
└───────────────┘ └──────────┘ └──────────┘  └──────────────────┘
        │
┌───────▼──────────────────────────┐
│ security-audit.yml (weekly)      │
│ npm audit + outdated + licenses  │
└──────────────────────────────────┘
```

---

## Branching Strategy

```
main         ← production. Protected. Only merge via PR.
staging      ← QA environment. Merges from feature branches.
feature/*    ← individual feature work. Gets a PR preview URL.
```

### Protecting `main`
Go to **Settings → Branches → Add rule**:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass (lint, build)
- ✅ Require up-to-date branches before merging
- ✅ Restrict pushes that create files (optional)

---

## Secrets Required

| Secret | Where to get it | Used by |
|--------|----------------|---------|
| `SURGE_TOKEN` | Run `surge token` | staging + PR previews |
| `GITHUB_TOKEN` | Auto-provided | GitHub Pages deploy |

Set secrets at: **Settings → Secrets and variables → Actions**

---

## Setup Guide

### 1. GitHub Pages (production)
```
Settings → Pages → Source: GitHub Actions
```
The first push to `main` will deploy automatically.

### 2. Staging (Surge.sh)
```bash
npm install -g surge
surge login        # creates an account if needed
surge token        # copy this value → add as SURGE_TOKEN secret
```
Change `STAGING_URL` in `deploy-staging.yml` to something unique like `orbit-yourname-staging.surge.sh`.

### 3. PR Previews
Same `SURGE_TOKEN`. Each PR gets `orbit-pr-{number}.surge.sh`. Torn down on close.

### 4. Docker (optional — for cloud hosting)
Push a tag:
```bash
git tag v2.0.0
git push origin v2.0.0
```
Image lands at `ghcr.io/YOUR_USERNAME/orbit:2.0.0`.

Run it anywhere:
```bash
docker run -p 8080:80 ghcr.io/YOUR_USERNAME/orbit:latest
```

---

## File Structure

```
.github/
├── dependabot.yml                    ← auto dependency PRs
└── workflows/
    ├── deploy-production.yml         ← main → GitHub Pages
    ├── deploy-staging.yml            ← staging → Surge
    ├── pr-preview.yml                ← PR → preview URL
    ├── security-audit.yml            ← weekly security scan
    └── docker.yml                    ← tag → GHCR image
Dockerfile                            ← 2-stage build (Node + Nginx)
nginx.conf                            ← SPA routing + cache headers
```

---

## Deploying to Cloud (beyond GitHub Pages)

### Vercel (zero config, recommended)
```bash
npm install -g vercel
vercel --prod
```
Or connect the repo in vercel.com — it detects Vite automatically.

### AWS Amplify
Connect repo in AWS Amplify Console. Build command: `npm run build`. Output: `dist/`.

### Google Cloud Run (Docker)
```bash
gcloud run deploy orbit \
  --image ghcr.io/YOUR_USERNAME/orbit:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
