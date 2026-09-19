# Lando Norris Site

Vite + React + Tailwind. Currently the Hero section only.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## What's here

- **`src/App.jsx`** — top-level layout
- **`src/components/Hero.jsx`** — hero section: cloud video aura + portrait swap on cursor
- **`src/components/Chrome.jsx`** — LANDO NORRIS wordmark, LN halo above head, Store + hamburger
- **`src/components/NextRaceCard.jsx`** — bottom-left race card
- **`src/components/Topo.jsx`** — topographic contour lines background
- **`public/bg_video.mp4`** — the cloud/portal video (drop-in replaceable)
- **`public/portraits/portrait_1.webp`**, `_2`, `_3` — the three portraits that cycle on hover

## Swap the assets

Replace files in `public/` with your own — keep the same filenames or update the paths at the top of `src/components/Hero.jsx`.
