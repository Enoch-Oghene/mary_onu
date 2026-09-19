// AlbumSection.jsx
//
// Section that follows PartnersSection. Content-only — the cream+topo
// background is provided by the SAME shared sticky layer in App.jsx that
// covers ChampionSection and PartnersSection, so all three sections read
// as one continuous scrolling surface.
//
// Layout: seven portrait cards laid out horizontally in a native
// scroll-snap rail. On top of the raw scroll we apply per-card transforms
// keyed to each card's distance from the rail's visible centre — so the
// centred card is at full scale with zero rotation and highest z-index,
// and every other card is progressively scaled down, tilted outward, and
// pulled slightly toward the centre so it tucks behind its neighbour.
// The result is a "fanned deck" that looks like the reference at rest AND
// re-shuffles smoothly as the user swipes left or right; whichever card
// snaps to centre gets promoted to the front position.
//
// Scroll is native, so it works with touch swipe, trackpad gesture, and
// shift+scroll. snap-x + snap-mandatory + snap-center on each card make
// the rail settle with exactly one card centred whenever the user lets
// go, matching the visual "one card is the hero" arrangement.

import { useLayoutEffect, useRef } from "react";

const PHOTOS = [
  "/gallery/album_01.webp",
  "/gallery/album_02.webp",
  "/gallery/album_03.webp",
  "/gallery/album_04.webp",
  "/gallery/album_05.webp",
  "/gallery/album_06.webp",
  "/gallery/album_07.webp",
];

// Transform magnitudes as functions of `n` — the signed number of "card
// steps" a card is away from the rail's visible centre. n = 0 → the card
// is dead-centre; n = ±1 → one card away; and so on. Kept as top-level
// constants so tuning the whole deck is a matter of changing a few numbers.
const SCALE_STEP = 0.14; // how much smaller per step out (with floor)
const SCALE_MIN = 0.55;
const ROT_STEP = 7; // deg tilt per step out (with cap)
const ROT_MAX = 22;
const PULL_STEP = 90; // px each card is pulled toward centre per step
const DROP_STEP = 10; // px each card drops per step (fan curve)
const DROP_MAX = 30;
const OPACITY_STEP = 0.15; // how much fainter per step out (with floor)
const OPACITY_MIN = 0.5;

export default function AlbumSection() {
  const railRef = useRef(null);

  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    // Compute per-card transforms from the current scroll position and
    // write them straight to inline style — cheaper than driving React
    // state on every scroll frame.
    const applyTransforms = () => {
      const cards = rail.querySelectorAll("[data-card]");
      if (cards.length < 2) return;

      const railCentre = rail.scrollLeft + rail.offsetWidth / 2;

      // "Step" = distance between adjacent card centres (constant across
      // the rail). Measured from the first two cards so it stays correct
      // if the card size / gap ever changes at a breakpoint.
      const c0 = cards[0].offsetLeft + cards[0].offsetWidth / 2;
      const c1 = cards[1].offsetLeft + cards[1].offsetWidth / 2;
      const step = c1 - c0;

      cards.forEach((card) => {
        const cardCentre = card.offsetLeft + card.offsetWidth / 2;
        const n = (cardCentre - railCentre) / step; // signed, fractional
        const abs = Math.abs(n);

        const scale = Math.max(SCALE_MIN, 1 - abs * SCALE_STEP);
        const rot = Math.max(-ROT_MAX, Math.min(ROT_MAX, n * ROT_STEP));
        const tx = -n * PULL_STEP; // toward centre
        const ty = Math.min(DROP_MAX, abs * DROP_STEP); // fan curve
        const opacity = Math.max(OPACITY_MIN, 1 - abs * OPACITY_STEP);
        const z = Math.round(100 - abs * 20); // centre wins

        card.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rot}deg)`;
        card.style.opacity = String(opacity);
        card.style.zIndex = String(z);
      });
    };

    // Centre the middle card on first render, then run the transform
    // pass BEFORE the browser paints — no flash of flush-left state.
    const middleIdx = Math.floor(PHOTOS.length / 2);
    const cards = rail.querySelectorAll("[data-card]");
    const middleCard = cards[middleIdx];
    if (middleCard) {
      rail.scrollLeft =
        middleCard.offsetLeft +
        middleCard.offsetWidth / 2 -
        rail.offsetWidth / 2;
    }
    applyTransforms();

    // rAF-throttle scroll updates to one paint frame.
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyTransforms);
    };
    const onResize = () => applyTransforms();

    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100vh" }}
    >
      <div className="absolute inset-0 flex items-center">
        {/* Scrollable rail. Scrollbar hidden in every engine
            (Firefox, WebKit, IE) via the three property/pseudo rules. */}
        <div
          ref={railRef}
          className="w-full overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Padding equals (rail-width − card-width)/2 so first and last
              cards can still snap to true centre. */}
          <div className="flex items-center gap-5 md:gap-8 pl-[calc(50%-110px)] pr-[calc(50%-110px)] md:pl-[calc(50%-140px)] md:pr-[calc(50%-140px)]">
            {PHOTOS.map((src, i) => (
              <div
                key={i}
                data-card=""
                className="flex-shrink-0 snap-center rounded-[26px] overflow-hidden w-[220px] md:w-[280px] aspect-[3/4]"
                style={{
                  boxShadow: "0 12px 32px rgba(37, 40, 26, 0.28)",
                  transformOrigin: "center center",
                  willChange: "transform, opacity",
                }}
              >
                <img
                  src={src}
                  alt=""
                  draggable="false"
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
