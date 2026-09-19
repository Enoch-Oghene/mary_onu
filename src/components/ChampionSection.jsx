// ChampionSection.jsx
//
// Section that follows HelmetsSection. Three visual bands stacked down
// the viewport:
//
//   1. OLIVE top band — a CTA (helmet+laurels icon, italic-serif tagline,
//      "VIEW ON TRACK" acid button). The olive here is the same shade
//      HelmetsSection ends on, so the two sections read as one continuous
//      dark surface until the curve reveals itself.
//
//   2. A CURVED boundary between the olive and cream areas. The boundary
//      is scroll-driven: at rest (curve below the fold) it is a straight
//      horizontal line; as it moves through the viewport the left endpoint
//      drops, the right endpoint rises, and a gentle mid-dip appears —
//      producing the asymmetric arc the design calls for. Progress is
//      anchored to the curve's own screen position rather than the section
//      top, so the morph happens WHILE the boundary is visible, not
//      before.
//
//   3. A CREAM band that holds the copy — WORLD DRIVERS' CHAMPION heading
//      (bold sans + italic serif), an intro paragraph, a "VISIT THE STORE"
//      acid button, and the LN1 acid wordmark in the corner. The band is
//      also home to the hero photo (top-right) and an AnimatedTopo canvas
//      of contour lines — the same olive-tinted, moving pattern the
//      OnOffSection cream area uses — clipped to the curved shape via an
//      SVG clipPath so the lines only show inside the cream, never in the
//      olive band above.
//
// The photo sits entirely INSIDE the cream area, tucked into the right
// pocket the curve opens up. It rises slightly as the curve morphs, so it
// tracks the boundary instead of leaving a dead gap.

import { useEffect, useRef, useState, useId } from "react";

const OLIVE = "#25281A";
const CREAM = "#EFEBDE";
const ACID = "#CCFF33";
const PHOTO = "/gallery/champion.webp";

// Section geometry, all in vh
const SECTION_H = 120; // total section height
const CREAM_TOP = 50; // where the cream container starts (SVG box origin)
const CREAM_H = SECTION_H - CREAM_TOP; // 70vh cream container
// Baseline y (SVG viewBox 0–100) of the flat pre-scroll boundary.
// Section-space y = CREAM_TOP + BASELINE_Y_SVG * CREAM_H / 100.
const BASELINE_Y_SVG = 15;
// Where the CURVE sits in the section at rest, used to anchor progress
// to its actual screen position:
const CURVE_Y_VH = CREAM_TOP + (BASELINE_Y_SVG * CREAM_H) / 100; // 65vh

// Same hook arrow used on the OnOffSection buttons, kept here so the two
// acid buttons in this section (VIEW ON TRACK, VISIT THE STORE) read as
// members of the same family.
function HookArrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M 4 6 L 4 12 Q 4 17 9 17 L 19 17 M 19 17 L 14 12 M 19 17 L 14 22" />
    </svg>
  );
}

export default function ChampionSection() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // useId gives us a stable, collision-free clipPath id even if the
  // component is ever mounted more than once on a page.
  const rawId = useId();
  const clipId = `champCurve-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  // Progress = 0 when the boundary sits at the bottom of the viewport,
  // 1 when it has scrolled up to the top. Ties the morph to what the
  // user is actually looking at.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const curvePos = rect.top + (CURVE_Y_VH * vh) / 100;
      const t = Math.max(0, Math.min(1, (vh - curvePos) / vh));
      setProgress(t);
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

  // Smoothstep so the morph settles smoothly at both ends.
  const p = progress * progress * (3 - 2 * progress);

  // Symmetric horizontal arc. Both endpoints stay level at BASELINE_Y_SVG;
  // only the mid-control point drops. At p=0 the three points coincide, so
  // the boundary is a pure horizontal line; at p=1 the control drops by 15
  // in viewBox space, pulling the visible curve mid down by ~7–8 units (a
  // shallow dip, not a bowl — quadratic Bézier midpoint sits halfway
  // between endpoints and control).
  const cutL = BASELINE_Y_SVG;
  const cutMid = BASELINE_Y_SVG + p * 8;
  const cutR = BASELINE_Y_SVG;

  // clipPath uses objectBoundingBox coords (0–1) so it scales with its
  // clipped element regardless of viewport size. This path now describes
  // the OLIVE CAP at the top of the section (not the cream area below) —
  // the section itself is transparent, and everything below the cap is
  // just a window onto the shared cream+topo background layered behind
  // both this section and PartnersSection.
  // Y values are converted from cream-area-local (0–100) to full-section
  // fractions: y_frac = (CREAM_TOP + cut) / SECTION_H.
  const capBottomL = (CREAM_TOP + cutL) / SECTION_H;
  const capBottomMid = (CREAM_TOP + cutMid) / SECTION_H;
  const capBottomR = (CREAM_TOP + cutR) / SECTION_H;
  const pathBBox =
    `M 0 0 L 1 0 L 1 ${capBottomR}` +
    ` Q 0.5 ${capBottomMid} 0 ${capBottomL} Z`;

  // At rest the photo sits entirely below the cream baseline (~65vh);
  // as the user scrolls, its top rises up past the boundary into the
  // olive band. Same progress that drives the arc drives the lift, so
  // the two moves feel like a single gesture.
  const photoTopVh = 68 - p * 18;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: `${SECTION_H}vh` }}
    >
      {/* clipPath def — path values update every frame via React state */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={pathBBox} />
          </clipPath>
        </defs>
      </svg>

      {/* ============ 1. CTA on the OLIVE top band ============ */}
      <div
        className="relative z-30 flex flex-col items-center text-center px-6 pt-16 md:pt-20"
        style={{ color: CREAM }}
      >
        <p
          className="text-[16px] md:text-[20px] leading-snug italic max-w-[280px] md:max-w-md"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          See more helmets and highlights from Lando on the track
        </p>
        <button
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-[13px] tracking-wider"
          style={{
            background: ACID,
            color: OLIVE,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
          }}
        >
          VIEW ON TRACK
          <HookArrow className="w-4 h-4" />
        </button>
      </div>

      {/* ============ 2. OLIVE cap, clipped to the curved shape ============ */}
      {/* This is now the ONLY thing this section paints for background —
          it covers the top area above the animated curve. Everything below
          the cap is transparent, revealing the shared cream+topo layer
          that lives in App.jsx behind both this section and PartnersSection.
          That's how the two sections read as scrolling over one continuous
          background. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: OLIVE,
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
        aria-hidden
      />

      {/* ============ 3. Hero photo, tucked into the cream pocket ============ */}
      <img
        src={PHOTO}
        alt=""
        draggable="false"
        className="absolute right-0 pointer-events-none select-none object-cover z-10"
        style={{
          top: `${photoTopVh}vh`,
          width: "52%",
          height: "40vh",
        }}
      />

      {/* ============ 4. CREAM copy — heading, body, button ============ */}
      <div
        className="absolute inset-x-0 px-6 z-20"
        style={{ top: "82vh", color: OLIVE }}
      >
        <div className="max-w-[62%] md:max-w-[55%]">
          <div
            className="text-[22px] md:text-[36px] leading-[0.92] tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
          >
            WORLD
            <br />
            DRIVERS'
          </div>
          <div
            className="text-[22px] md:text-[36px] leading-[1.02] italic mt-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontStyle: "italic",
            }}
          >
            CHAMPION
          </div>

          <p
            className="mt-5 text-[9px] md:text-[9px] leading-[1.4]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
          >
            Celebrate this
            <br />
            incredible moment
            <br />
            with a collection
            <br />
            designed for the fans
            <br />
            who never stopped
            <br />
            believing. Wear it,
            <br />
            frame it, treasure
            <br />
            it forever.
          </p>
        </div>
      </div>
    </section>
  );
}
