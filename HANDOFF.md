# Lando Norris Fan Site — Handoff

Continuing an iterative build. This document captures where things stand so a fresh chat can pick up without re-reading the transcript.

---

## 1. Project overview

**What it is:** A single-page Lando Norris fan site with a shrinking-photo hero, a long editorial gallery of captioned photos with pull quotes, and an "On Track / Off Track" split-column section. Mobile-first, uses stock/placeholder portraits as photos of Lando.

**Stack**
- Vite 5 + React 18 + Tailwind 3.4
- `lucide-react` for icons
- No routing, no data-fetching, no server — all state is in `App.jsx` and per-component `useState`

**Working directory in the container:** `/home/claude/site/lando-site/`
**Repackaged zip lives at:** `/mnt/user-data/outputs/lando-norris-site.zip`

---

## 2. Working on this project

### Dev workflow (from inside the project folder)
```
npm install
npm run dev          # dev server at http://127.0.0.1:5173/
npm run build        # production build to dist/
```

### The Windows extraction footgun
The user is on Windows. File Explorer's built-in "Extract All" **silently drops files** — `HeroShrink.jsx` and `Menu.jsx` were each lost in separate incidents this way. Always tell them to unpack with PowerShell:
```
Remove-Item -Recurse -Force lando-norris-site
Expand-Archive -Path .\lando-norris-site.zip -DestinationPath .\lando-norris-site -Force
```

### How the user likes to iterate
- **Single-file outputs**, not zips. Once the project is set up on their machine, every follow-up should ship just the files that changed via `present_files`. Only zip when there are new assets (images) or a lot of files at once.
- **Very short prompts, high iteration cadence.** They send a screenshot, describe the change in a sentence, and expect a surgical edit. Sometimes reverses earlier decisions — that's normal, follow the latest instruction.
- **Mobile-first.** Nearly every reference screenshot they send is a mobile viewport (~429×697 or ~411×700). Match mobile carefully first; desktop is secondary.
- **Verify visually before shipping.** Spin up vite in the container, take a Playwright screenshot at the scroll position that matches their reference, compare, iterate until it matches, then output.

---

## 3. File structure

```
lando-site/
├── public/
│   └── gallery/
│       ├── g01.jpg … g12.jpg    Gemini-generated portrait placeholders (~50–125 KB each)
│       ├── ontrack.webp/.png    Green-top portrait, bg-removed (used in OnOffSection left)
│       └── offtrack.webp/.png   Brown-blazer portrait, bg-removed (used in OnOffSection right)
├── src/
│   ├── App.jsx                  Top-level composition + fixed chrome overlays
│   ├── main.jsx / index.css     Boilerplate
│   └── components/
│       ├── HeroShrink.jsx       350vh sticky shrinking-photo hero (ACTIVE)
│       ├── GallerySection.jsx   Writeup + 9 photos + 2 quotes + olive→cream fade (ACTIVE)
│       ├── OnOffSection.jsx     ON TRACK / OFF TRACK split with slide-in (ACTIVE)
│       ├── Menu.jsx             Full-screen menu overlay (ACTIVE)
│       ├── AnimatedTopo.jsx     Marching-squares contour canvas (used by many sections)
│       ├── Chrome.jsx           Small chrome bits: StoreButton, MenuButton, LNHalo, Wordmark
│       ├── NextRaceCard.jsx     Desktop-only bottom card
│       ├── TapToLock.jsx        Mobile-only bottom-right pill
│       ├── Hero.jsx             OLD static hero — unused, safe to delete
│       ├── Topo.jsx             OLD non-animated topo — unused, safe to delete
│       └── LegacySection.jsx    Standalone writeup — merged into GallerySection, unused
```

**Composition in `App.jsx`:**
```jsx
<HeroShrink />
<GallerySection />
<OnOffSection />
<Menu />              // overlay
{chrome buttons, wordmark, halo, next-race, tap-to-lock}
```

**Dead code:** `Hero.jsx`, `Topo.jsx`, `LegacySection.jsx` are not imported anywhere. They can be deleted at any time.

---

## 4. Design tokens (Tailwind + inline)

- **Cream (background):** `#EFEBDE` — `bg-cream` / `text-cream` in Tailwind
- **Olive (dark background & text on cream):** `#25281A`
- **Acid green (accent):** `#CCFF33` — `bg-acid` / `text-acid`
- **Fonts** (loaded via Google in `index.html`):
  - Inter — 400/500/700/800/900
  - Playfair Display — for italic serif accents (`"WINS"`, `"LEGACY"`, quotes, "ON"/"OFF" labels)
  - Poppins Light (300) — the hero ticker top row
  - Montserrat Bold (700) — the hero ticker bottom row

---

## 5. Component walkthrough

### `HeroShrink.jsx`
350vh-tall sticky hero. Portrait bottom-anchored initially (`h-92vh` desktop / `h-65vh` mobile, aspect 976/675). As user scrolls, the frame shrinks to a portrait 4:5 crop (`endH = min(H*0.62, 500)`, `endW = endH * 0.8`). Height shrinks first (progress 0→0.55), width later (0.18→1). Portrait interpolates from initial size to fill the shrinking frame by progress 0.25.

Olive-wash overlay on the photo (two layers — dark olive multiply gradient + olive color-blend) fades in via `photoTintOpacity = smoothstep(max(0, (progress-0.35)*1.8))`, matching the Menu inactive-tile treatment.

Ticker rows sit just below the frame:
- top row = Poppins Light 300 acid green `text-[17px] md:text-[21px]`
- bottom row = Montserrat Bold 700 white `text-[14px] md:text-[17px]`
- `gap-[2px]` between them

Cursor tilt on the portrait via `--tilt-x/y` CSS vars.

**Known removed items:** the "MESSAGE FROM LANDO" label, the `LN` component, and `labelOpacity` are all gone.

### `AnimatedTopo.jsx`
The workhorse background component. Sums drifting gaussian blobs into a scalar field, samples on a grid, and runs a **contour-tracing marching-squares** algorithm (with saddle disambiguation using centre-cell field value) to draw iso-lines as continuous unbroken paths. No visible cell seams, no saddle X-crosshairs.

Props: `bg`, `lineColor`, `numBlobs`, `cellSize`, `numLevels`, `levelStep`, `levelStart`, `strokeWidth`, `mixBlendMode`, `animate`.

- `bg={null}` skips the per-frame `fillRect` so the canvas is transparent and whatever's behind shows through.
- `mixBlendMode="difference"` was used in earlier iterations to make lines adapt to changing bg colours; **no longer needed** in current design (bg is solid where topo appears).
- **`animate={false}` freezes the pattern** — draws one frame at t=0 and never requests another. Redraws once on resize. Used in `OnOffSection`.

Pair arrays for the switch are hoisted to module constants (`P_1_14`, etc., `P_SADDLE_A/B`) so the hot path is allocation-free.

### `GallerySection.jsx`
Currently the biggest section. Contains **both** the "REDEFINING LIMITS…" mixed-typography writeup (was originally `LegacySection`) **and** the nine staggered photos with two pull quotes. Structure:

1. **Sticky pinned bg stack** (`position: sticky; top: 0; height: 100vh; margin-bottom: -100vh`) — olive base layer, cream overlay whose opacity is scroll-driven, and an animated topo overlay pinned in the viewport.
2. **Content over it:**
   - Writeup: `min-h-screen` centred block with forced 2/2/3/4/3/4/3/1 word line breaks on mobile via `<br className="md:hidden" />`. `text-[24px] md:text-[68px]`. Acid Playfair italic 900 for `REDEFINING`, `WINS`, `LEGACY`; cream Inter 900 for the rest.
   - Photos, alternating left/right with individual `mt-*` offsets: QATAR 2024 → FIA PRIZE GIVING 2024 → MIAMI GP 2024 → Quote 1 → BRITAIN 2025 → gap → BATTERSEA 2024 → HIGH PERFORMANCE GALA 2024 → BARCELONA 2024 → Quote 2 → AUSTRIA 2020 → US 2024.
   - **Scroll marker** (`markerRef`) sits in the gap between photo 4 and photo 5. A scroll listener maps its viewport position to `creamAmount` (0..1) over a ~120vh range — the cream overlay's opacity fades in as the marker crosses the viewport. That's what gives the seamless olive→cream palette drift without a visible cut-over.
3. **Two photo halves:** photos 1–4 + Quote 1 use `color: #EFEBDE` (cream text on olive), photos 5–9 + Quote 2 use `color: #25281A` (dark text on cream).

**Photo component features:**
- `inactive` prop: applies the two-layer olive wash (menu inactive-tile treatment) to the image.
- `rotate` prop (in degrees, negative = counter-clockwise): wraps the img in a container with `aspectRatio: '3 / 4'` and applies `translate(-50%, -50%) rotate(<deg>) scale(1.3333)`, so a 4:3 landscape source spins to fill a 3:4 portrait cell edge-to-edge.

**Random tinting:** on mount, `useState(() => …)` picks 3 indices from 0–8 via Fisher–Yates and stores them in a Set. Each of the 9 photos gets `inactive={isTinted(i)}` — so 3 different photos are olive-washed per page load.

**Currently rotated:** `g03.jpg` (MIAMI GP) and `g08.jpg` (AUSTRIA) both pass `rotate={-90}`.

Topo settings for this section: `lineColor="rgba(120, 130, 90, 0.45)"`, `strokeWidth={1.1}`, `numBlobs={7}`, `numLevels={5}`, `levelStart={0.15}`, `levelStep={0.32}`, animated (default).

### `OnOffSection.jsx`
Two-column split section immediately after the gallery. Cream bg, olive text.

**Layout (mobile reference is authoritative):**
- Left column (`ON TRACK`): all content **right-aligned** (flush to inner edge, facing middle).
- Right column (`OFF TRACK`): all content **left-aligned** (facing middle).
- Fonts: `ON`/`OFF` = Playfair italic `text-[13px] md:text-[20px]`; `TRACK` = Inter black 900 `text-[28px] md:text-[46px]`.
- Description = Playfair italic `text-[13px] md:text-[15px]`, aligned matching column.
- Acid green square button below description with a hooked-arrow SVG.
- Half portraits (`ontrack.webp`, `offtrack.webp`) at the bottom, extending past the outer edges (`left: -25%; width: 125%` on the left; `right: -25%; width: 125%` mirrored on the right).

**Slide-in animation:** `useRef` + scroll listener computes `progress = clamp((0.9vh - sectionTop) / (0.9vh - 0.25vh), 0, 1)`, smoothstepped to `p`. Left column `transform: translateX((p - 1) * 100%)`, right column `translateX((1 - p) * 100%)`. Columns enter from off-screen edges and settle in place.

**Background:** the same olive-tint AnimatedTopo used by the cream half of the gallery, but with `animate={false}` — it's frozen. Pinned to the viewport via `position: sticky; top: 0; height: 100vh; margin-bottom: -100vh` so it does not scroll with the page.

**Section is `height: 100vh`** (not `min-height`) so everything — heading, description, button, half-image — fits in exactly one viewport, matching the reference. Image container is `flex-1 mt-4` with the img absolute-bottom-0.

**Note:** the acid "ON" scribble overlay was removed by user request. `OnScribble` is no longer in the file.

### `Menu.jsx`
Full-screen menu overlay opened via `MenuButton`. Grid of tiles for menu items; non-selected tiles get an olive multiply gradient + olive color-blend that desaturates them ("inactive tile treatment"). This exact treatment is reused elsewhere:
- On hero portrait (during shrink)
- On 3 random gallery photos (via `Photo.inactive` prop)

The exact CSS is worth memorising because it appears in three files:
```jsx
<div className="absolute inset-0 pointer-events-none"
     style={{
       background: "linear-gradient(180deg, rgba(37,40,26,0.6) 0%, rgba(37,40,26,0.8) 100%)",
       mixBlendMode: "multiply",
     }} />
<div className="absolute inset-0 pointer-events-none"
     style={{ background: "rgba(50,60,30,0.35)", mixBlendMode: "color" }} />
```

---

## 6. Recent iteration history (in reverse chronological order)

Most recent decisions the user made, so you know the state of the world:

1. **`OnOffSection`, latest state:**
   - Reduced heading fonts to `text-[28px] / md:text-[46px]` for TRACK
   - Removed the acid `OnScribble` overlay
   - Made the topo static via `animate={false}` (I added this prop to `AnimatedTopo`)
   - Alignment: left column right-aligned, right column left-aligned (both facing middle) — this was flipped multiple times, current state matches the "meet in the middle" reference
   - `height: 100vh` (not min-height) so image is visible in same viewport as heading
2. **User has been re-emphasising:** "the entire white background should be static, no movement" — I've been interpreting this as pinning the topo via sticky + freezing its animation with `animate={false}`. If they say it again, they may want something stronger — e.g. a truly page-wide fixed topo that never moves at all.
3. **User has been re-emphasising:** "the image is still not showing" — likely because they haven't copied `ontrack.webp` and `offtrack.webp` into `public/gallery/`. Always include those images in every delivery, or at least remind them where they go.
4. **Rotation added to Photo:** MIAMI GP (g03) and AUSTRIA (g08) rotate -90° to the left; the container aspect flips to 3:4 and the img is scaled by 1.333 to fill exactly.
5. **Random olive-wash tint** on 3 of 9 gallery photos, picked once per page load.
6. **Gallery + Legacy merged** into a single `GallerySection` because two adjacent sections each with their own topo canvas left a visible seam of "empty" bg between them.

---

## 7. Known state / what works / what might still bug them

**Confirmed working (verified via Playwright screenshots):**
- Full page renders, scrolls smoothly
- Hero shrink animation
- Continuous contour lines through the whole gallery via one shared canvas
- Smooth olive→cream fade in gallery (no visible transition point)
- OnOffSection slide-in from sides, static topo, images visible in same viewport

**Known to sometimes bug the user:**
- **Image loading.** If they don't have `ontrack.webp` / `offtrack.webp` in `public/gallery/`, the OnOffSection halves will be blank. Same for the 12 `g0X.jpg` gallery images. Always ship image files with any relevant code change.
- **"Background is scrolling" / "not static".** Ambiguous. Historically meant: the section's `linear-gradient` bg scrolled with content (a gradient snapping past). Fixed by moving the palette change to a scroll-driven opacity on a pinned overlay. If they still complain, the next step is probably to make the topo canvas `position: fixed` on the App level and persist it across sections rather than pin per-section.
- **Mobile viewport size.** Their reference screenshots vary (~375, ~411, ~429, ~440). Test at multiple widths.

**Nothing pending as of end of last message** — user asked for the handoff doc and zip, so they're taking a break here.

---

## 8. Container-side tooling notes

For screenshots I use Playwright:
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 429, "height": 697})
    page = ctx.new_page()
    page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
    page.wait_for_timeout(1500)
    # Force-load lazy images by scrolling through:
    for y in range(0, 12000, 400):
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(150)
    # …then scroll to what you want to see
    page.screenshot(path="/home/claude/shots/x.png")
```

Photos use `loading="lazy"`, which means `full_page=True` screenshots don't render below-fold images. Pre-scroll through the doc to trigger loads, then take the shot.

Dev server: `setsid nohup node_modules/.bin/vite --host 127.0.0.1 --port 5173 > /tmp/vite.log 2>&1 < /dev/null &` then wait ~6s. `pkill -f vite` to stop before repackaging the zip.

---

## 9. Image processing pipeline (if new images arrive)

If the user drops in new `.jfif` files from Gemini, the pipeline that's been working:

**For gallery photos (opaque, keep bg):**
```python
img = ImageOps.exif_transpose(Image.open(path))
img.thumbnail((900, 900), Image.LANCZOS)
img.save(out, "JPEG", quality=82, optimize=True)
```
~50–125 KB per file, ~1 MB total for 12 photos.

**For portraits that need transparent bg** (like `ontrack`/`offtrack`):
`rembg` is available but pulls a 1 GB model on first use and got OOM-killed. The reliable fallback is chroma-key against the AI's checkerboard-transparent bg:
```python
chroma = max(RGB) - min(RGB)
is_bg = (chroma < 18) & (max_c > 130)
alpha = np.where(is_bg, 0, 255)
# MinFilter(3) + MaxFilter(3) + GaussianBlur(0.6) to clean edges
```
Then save as WebP quality 82 (~50–90 KB per portrait) — much smaller than PNG.

---

## 10. Quick reference — where the numbers came from

Tokens the user cares about that aren't in Tailwind config:
- Gallery scroll-marker fade window: **90% down viewport → 30% above viewport top** (a ~120vh smooth transition)
- OnOff slide-in trigger: **90% down viewport → 25% down** (starts when section approaches, done when 25% down)
- Photo tint (`inactive`): the linear gradient uses `rgba(37,40,26, 0.6→0.8)` because those numbers **are** `#25281A` = the olive base
- 3-random-photo selection: `useState(() => new Set(shuffled.slice(0, 3)))` — replace with `new Set([2, 5, 7])` (or any three indices) if user asks for the tinted photos to be stable across refreshes.

That's everything I'd want to hand to future-me.
