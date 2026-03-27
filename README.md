# Personal Planner

A personal daily planner PWA for tracking habits, todos, and meals.
Live at: **https://emilyjonesr.github.io/PersonalPlanner/**

---

## Installing on your phone (iPhone)

1. Open Safari and go to **https://emilyjonesr.github.io/PersonalPlanner/**
2. Tap the **Share** button (box with arrow at the bottom of the screen)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add** — it'll appear on your home screen like an app

> To update the icon after a new deploy: press and hold the icon → **Remove from Home Screen** (not Delete!) → then re-add it from Safari. Your data will be safe as long as you don't tap Delete.

---

## Installing on desktop (Chrome/Edge)

1. Go to **https://emilyjonesr.github.io/PersonalPlanner/**
2. Click the **install icon** (⊕) in the address bar on the right side
3. Click **Install** — it'll open as a standalone app and appear in your dock/taskbar

---

## Running locally (for development)

```bash
cd planner
npm install
npm run dev
```

Then open **http://localhost:5173/PersonalPlanner/** in your browser.

---

## Deploying

Push to the `main` branch and GitHub Actions will automatically build and deploy to GitHub Pages.

```bash
git add .
git commit -m "your message"
git push
```
