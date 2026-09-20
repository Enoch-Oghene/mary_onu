// SharedBackground.jsx
//
// ONE static background layer that sits behind every section after the hero.
// It is position:fixed so it stays anchored to the viewport — the page's
// content scrolls THROUGH it rather than dragging it along. This replaces
// the per-section sticky backgrounds that GallerySection and OnOffSection
// used to render individually, so there are no more topo resets at section
// boundaries and no cutovers between adjacent bg layers.
//
// The olive→cream drift that used to live inside GallerySection now lives
// here. GallerySection still owns the WHERE (a marker div with the shared
// id sits between its two photo halves); this component owns the HOW (a
// scroll listener maps that marker's viewport position to a 0→1 fade).
//
// Hero note: the hero renders its own opaque background stack on top of
// this layer via DOM order, so nothing here shows during the hero scroll.

import { useEffect, useState } from "react";
import AnimatedTopo from "./AnimatedTopo.jsx";

export const CREAM_FADE_MARKER_ID = "shared-bg-cream-marker";

const OLIVE = "#25281A";
const CREAM = "#EFEBDE";

export default function SharedBackground() {
  const [creamAmount, setCreamAmount] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const marker = document.getElementById(CREAM_FADE_MARKER_ID);
      if (!marker) {
        // Marker not mounted yet (e.g. gallery hasn't rendered) — keep bg
        // fully olive so the transition can play naturally when it appears.
        setCreamAmount(0);
        return;
      }
      const rect = marker.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Fade window: begins when the marker enters the lower part of the
      // viewport, completes about a viewport after it has scrolled past the
      // top — a ~120vh scroll range for a seamless palette drift.
      const start = vh * 0.9;
      const end = vh * -0.3;
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      setCreamAmount(t);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {/* Olive base — always there */}
      <div className="absolute inset-0" style={{ background: OLIVE }} />
      {/* Cream overlay — opacity driven by scroll marker */}
      <div
        className="absolute inset-0"
        style={{ background: CREAM, opacity: creamAmount }}
      />
      {/* Topo lines — the olive-family tint reads as tone-in-tone on the
          olive half and a soft dusty tint on the cream half, so no
          adaptive blending is needed. */}
      <AnimatedTopo
        bg={null}
        lineColor="rgba(120, 130, 90, 0.45)"
        strokeWidth={1.1}
        numBlobs={7}
        numLevels={5}
        levelStart={0.15}
        levelStep={0.32}
      />
    </div>
  );
}
