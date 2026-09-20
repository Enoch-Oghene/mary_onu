// LifeTributeSection.jsx
//
// Life Tribute / Obituary section. Modelled on HelmetsSection: a full-
// width hero photo up top, a dark olive text panel underneath.
//
// TWO-STAGE OVERLAP OVER THE PRECEDING SECTION.
//
// Stage 1 — baseline via CSS negative margin (mt-[-39vw] md:mt-[-164px]):
// Pulls the section up 35% of the PoS half-portrait height in the DOM
// itself, so from the moment the section enters the viewport it sits
// with that hard border already cut across the portraits' bodies —
// this is the state visible in the reference screenshot.
//
// Stage 2 — scroll-driven climb on top (JS translateY):
// From that baseline, as the user continues to scroll, the section
// translates further upward via CSS transform. By the end of the
// entry animation the section's visual top lands at exactly the top
// of the viewport (row 0). It has "scrolled over" the portraits and
// reached the top of the page. After that, translate stays clamped
// at max, so continued scrolling carries the section past viewport-
// top naturally.
//
// The two work together — CSS gives the initial anchor, JS drives
// the motion. Removing the CSS margin would make the section start
// with no overlap; removing the JS would freeze it at the static
// baseline. Both are needed for the effect described.
//
// How the numbers combine:
//   • CSS margin ≈ 35% of portrait height (39vw mobile / 164px desktop).
//     Portraits are 170% × 50vw wide = 85vw, aspect 1728:2249 → height
//     ≈ 110.6vw. Desktop portraits are 360px wide → height ≈ 469px.
//   • Progress ramps 0 → 1 as the section's natural (WITH-margin) top
//     slides from viewport-bottom (vh) up to 40% down viewport (0.4·vh).
//   • Max translate = 0.4 · vh. At progress 1 the natural top with
//     margin is at 0.4vh and translate is -0.4vh, so visual top =
//     0.4vh − 0.4vh = 0.
//
// z-10 puts the section above the portraits' z-[5] stacking context
// so both the CSS-margin overlap and the JS-translated climb paint
// over the portraits, not under them.
//
// Text panel uses a 2-column CSS grid with the three body paragraphs
// placed in a staircase / editorial-zigzag pattern:
//
//   [ TITLE ]  [ COLUMN 1 ]      <- row 1
//   [ COL 2 ]  [    .     ]      <- row 2  (col 2 nudged left, under title)
//   [   .   ]  [ COLUMN 3 ]      <- row 3  (col 3 nudged right, under col 1)
//
// Section is `min-h-screen` so the tall obituary text can grow the
// mobile viewport past 100vh without cutting anything off; on desktop
// the same content sits comfortably inside a single screen.

import { useEffect, useRef, useState } from "react";

const OLIVE = "#25281A";
const CREAM = "#EFEBDE";
const PHOTO = "/gallery/tribute.webp";

export default function LifeTributeSection() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);

  // Scroll-driven overlap. Progress goes 0 → 1 as the section's natural
  // top slides from viewport-bottom (vh) up to 40% down viewport
  // (0.4·vh). Multiplied by maxOffset that becomes the translateY the
  // section is nudged up by, on top of the CSS margin already applied.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId = 0;

    // Natural document-top of the section, unaffected by any transform.
    // getBoundingClientRect() would include the transform we're about
    // to apply — walking the offsetTop chain avoids that. Measured on
    // every frame (not just at mount) so layout shifts from lazy-loaded
    // images upstream don't leave us with a stale value.
    const getOffsetTop = () => {
      let top = 0;
      let cursor = el;
      while (cursor) {
        top += cursor.offsetTop;
        cursor = cursor.offsetParent;
      }
      return top;
    };

    const measure = () => {
      // Max translate = 40% of viewport height. Combined with the
      // progress-1 endpoint below (natural top with-margin at 0.4·vh),
      // this puts the section's VISUAL top at exactly 0 (viewport top)
      // at the end of the animation — it has "scrolled over" the
      // portraits all the way up to the top of the page.
      setMaxOffset(window.innerHeight * 0.4);
    };

    const update = () => {
      const vh = window.innerHeight || 1;
      const sectionTop = getOffsetTop();
      const relTop = sectionTop - window.scrollY; // natural viewport-top
      const start = vh; // 0 progress when section top at vp-bottom
      const end = vh * 0.4; // 1 progress when section top at 40% down vp
      const t = Math.max(0, Math.min(1, (start - relTop) / (start - end)));
      setProgress(t);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Smoothstep easing so the climb doesn't feel mechanical.
  const p = progress * progress * (3 - 2 * progress);
  const translateY = -maxOffset * p;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden min-h-screen z-10 mt-[-39vw] md:mt-[-164px]"
      style={{
        background: OLIVE,
        transform: `translateY(${translateY}px)`,
        willChange: "transform",
      }}
    >
      {/* ============ TOP — Hero photo ============ */}
      {/* object-top keeps her face in the frame when the display aspect
          is wider than the source (source is 1200×1480, ~0.81 ratio). */}
      <div className="relative w-full h-[55vh] md:h-[60vh]">
        <img
          src={PHOTO}
          alt=""
          draggable="false"
          className="w-full h-full object-cover object-top select-none pointer-events-none"
        />
      </div>

      {/* ============ BOTTOM — Olive panel with staircase text ============ */}
      <div
        className="relative w-full px-5 md:px-10 py-8 md:py-12"
        style={{ color: CREAM }}
      >
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:gap-x-10 md:gap-y-10">
          {/* Row 1 · Col 1 — Title stack (LIFE TRIBUTE / Obituary) */}
          <div className="row-start-1 col-start-1 flex flex-col justify-start">
            <div
              className="text-[18px] md:text-[32px] leading-[0.95] tracking-tight"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 900,
                color: CREAM,
              }}
            >
              LIFE TRIBUTE
            </div>
            <div
              className="text-[16px] md:text-[28px] leading-[1.02] mt-1"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontStyle: "italic",
                color: "#CCFF33",
              }}
            >
              Obituary
            </div>
          </div>

          {/* Row 1 · Col 2 — Column 1 body */}
          <p
            className="row-start-1 col-start-2 text-[12px] md:text-[14px] leading-[1.45]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Madam Mary Onu Ogwo passed away peacefully on July 6, 2026, at the
            age of 62. She will be remembered for her warm smile, love,
            kindness, and industrious spirit.
          </p>

          {/* Row 2 · Col 1 — Column 2 body (nudged left, under the title) */}
          <p
            className="row-start-2 col-start-1 text-[12px] md:text-[14px] leading-[1.45]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Mary dedicated her life to serving Jehovah and sharing her faith
            with others. She symbolized her dedication to Jehovah God on
            February 25, 1978, and remained a faithful member of the South Post
            Oak Congregation of Jehovah&apos;s Witnesses until her passing. She
            was selfless both in her service to Jehovah and in her relationships
            with others.
          </p>

          {/* Row 3 · Col 2 — Column 3 body (nudged right, under column 1) */}
          <p
            className="row-start-3 col-start-2 text-[12px] md:text-[14px] leading-[1.45]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Mary deeply loved her family and took great joy in discussing the
            Bible&apos;s promise of a peaceful paradise Earth. She is survived
            by her loving spouse, Onu O. Onu; her 7 children; 3 grandchildren;
            10 siblings; a host of other relatives; and a large spiritual family
            of brothers and sisters worldwide who look forward to welcoming her
            back in the resurrection.
          </p>
        </div>
      </div>
    </section>
  );
}
