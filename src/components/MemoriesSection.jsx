// MemoriesSection.jsx
//
// Horizontal fanned-deck carousel of Madam Mary Onu Ogwo's portraits
// through the years. Placed after LifeTributeSection in the App flow.
//
// LAYOUT
//   • Centred title stack on top — "MEMORIES" (Inter Black, olive)
//     over "IN PICTURES" (Playfair Display italic, olive). Both dark
//     because the section reads on the shared cream+topo background
//     mounted in App.jsx (no local bg).
//   • A horizontal scroll-snap rail below. On top of the raw scroll
//     we apply per-card transforms keyed to each card's distance from
//     the rail's visible centre — so the centred card is at full
//     scale with zero rotation and highest z-index, and every other
//     card is progressively scaled down, tilted outward, and pulled
//     slightly toward the centre so it tucks behind its neighbour.
//     The result is a "fanned deck" that looks like the reference at
//     rest AND re-shuffles smoothly as the user swipes: whichever
//     card snaps to centre gets promoted to the front position.
//
// INTERACTION
//   Native horizontal scroll — works with touch swipe, trackpad
//   gesture, and shift+scroll on desktop mice. `snap-x` +
//   `snap-mandatory` + `snap-center` on each card make the rail
//   settle with exactly one card centred whenever the user lets go.
//
// BACKGROUND
//   No local background — the shared cream+topo layer in App.jsx
//   shows through. Matches the pattern used by GallerySection and
//   OnOffSection (Program of Service) so the palette reads as one
//   continuous cream surface once LifeTribute has scrolled past.
//
// Code lifted intentionally from AlbumSection.jsx which already
// solves this pattern — kept the constants and control flow the
// same so tuning either section keeps the same feel.

import { useLayoutEffect, useRef } from "react";

const OLIVE = "#25281A";

const PHOTOS = [
  "/gallery/memories_01.webp",
  "/gallery/memories_02.webp",
  "/gallery/memories_03.webp",
  "/gallery/memories_04.webp",
  "/gallery/memories_05.webp",
  "/gallery/memories_06.webp",
  "/gallery/memories_07.webp",
];

// Transform magnitudes as functions of `n` — signed number of card-
// steps a card is away from the rail's visible centre. n = 0 → the
// card is dead-centre; n = ±1 → one card away; and so on.
const SCALE_STEP = 0.14; // how much smaller per step out (with floor)
const SCALE_MIN = 0.55;
const ROT_STEP = 7; // deg tilt per step out (with cap)
const ROT_MAX = 22;
const PULL_STEP = 90; // px each card is pulled toward centre per step
const DROP_STEP = 10; // px each card drops per step (fan curve)
const DROP_MAX = 30;
const OPACITY_STEP = 0.15;
const OPACITY_MIN = 0.5;

export default function MemoriesSection() {
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

      // "Step" = distance between adjacent card centres (constant
      // across the rail). Measured from the first two cards so it
      // stays correct if the card size / gap ever changes at a
      // breakpoint.
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
      id="memories"
      className="relative w-full overflow-hidden flex flex-col"
      style={{ color: OLIVE, height: "100vh" }}
    >
      {/* ============ TITLE STACK — centred, sits above the carousel ============ */}
      <div className="relative z-10 pt-20 md:pt-28 text-center flex-shrink-0">
        <div
          className="text-[26px] md:text-[40px] leading-[0.95] tracking-tight"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
        >
          MEMORIES
        </div>
        <div
          className="text-[22px] md:text-[36px] leading-[1.02] italic mt-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontStyle: "italic",
          }}
        >
          IN PICTURES
        </div>
      </div>

      {/* ============ CAROUSEL RAIL — fills remaining vertical space ============ */}
      <div className="flex-1 flex items-center overflow-hidden">
        {/* Scrollbar hidden in every engine (Firefox, WebKit, IE) via
            the three property/pseudo rules. */}
        <div
          ref={railRef}
          className="w-full overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Padding equals (rail-width − card-width)/2 so first and
              last cards can still snap to true centre. */}
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
