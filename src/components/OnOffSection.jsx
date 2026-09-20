// OnOffSection.jsx
//
// Two-column "Program of Service" section.
//
// Layout:
//   • Centred "Program of Service" title on top.
//   • A shared 2-column grid below listing Role → Name pairs. Both columns
//     live in the SAME grid, so each pair shares a row and short labels
//     stay on the same visual line as the longer names they map to, even
//     when the name wraps to two lines on mobile.
//   • Half portraits at the bottom, extending past the OUTER edges of the
//     screen (left image past the left, right image past the right) —
//     preserved from the previous OnTrack/OffTrack design.
//
// As the section scrolls into view the left cells + left portrait slide
// in from the left edge and their right counterparts slide in from the
// right. Each cell carries its own transform so the shared grid stays
// row-aligned throughout the animation.
//
// Background is the shared static topo canvas mounted in App.jsx.

import { Fragment, useEffect, useRef, useState } from "react";

// \u2013 = en-dash, \u201C / \u201D = curly double quotes. Escaped rather
// than literal to keep the source portable across editors that mangle
// non-ASCII on save.
const ROWS = [
  ["Chairman", "Brother J. C. Bolden"],
  ["Opening Song", "Song 151 \u2013 \u201CHe Will Call\u201D"],
  ["Opening Prayer", "Brother J. C. Bolden"],
  ["Funeral Discourse", "Brother Okechukwu Ogori (Snr.)"],
  ["Discourse Theme", "\u201CThe Hope of the Resurrection\u201D"],
  ["Closing Song", "Song 153 \u2013 \u201CGive Me Courage\u201D"],
  ["Closing Prayer", "Brother Okechukwu Ogori"],
];

export default function OnOffSection() {
  const OLIVE = "#25281A";

  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const start = vh * 0.9;
      const end = vh * 0.25;
      const t = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
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

  const p = progress * progress * (3 - 2 * progress);
  const leftT = `translateX(${(p - 1) * 100}%)`;
  const rightT = `translateX(${(1 - p) * 100}%)`;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen"
      style={{ color: OLIVE }}
    >
      {/* ============ TEXT LAYER ============ */}
      {/* pb reserves vertical space so the row grid never overlaps the
          bottom-anchored portrait layer. Values match the rendered portrait
          heights computed from their fixed widths × natural aspect ratio
          (1728 : 2249 ≈ 1.302). */}
      <div className="relative z-10 pt-20 md:pt-28 pb-[470px] md:pb-[570px] px-3 md:px-6">
        {/* Section title (centred, no slide — sits still while the two
            columns meet in the middle around it). */}
        <h2
          className="text-center leading-[0.95] text-[28px] md:text-[44px] italic"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
        >
          Program of Service
        </h2>

        {/* Shared Role / Name grid. items-baseline keeps the first line of
            each pair on the same baseline; when a name wraps, its label sits
            flush with the wrapped line's top and the pairing stays visually
            locked. */}
        <div className="mt-8 md:mt-12 mx-auto max-w-[680px] grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3 md:gap-y-4 items-baseline">
          {/* Column headings */}
          <div
            className="text-right text-[20px] md:text-[28px] leading-none tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              transform: leftT,
              willChange: "transform",
            }}
          >
            Role
          </div>
          <div
            className="text-left text-[20px] md:text-[28px] leading-none tracking-tight"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 900,
              transform: rightT,
              willChange: "transform",
            }}
          >
            Name
          </div>

          {/* Content rows — Fragment holds each pair together for keying,
              but the two divs land as siblings in the grid so the two
              columns share row heights. */}
          {ROWS.map(([role, name], i) => (
            <Fragment key={i}>
              <div
                className="text-right text-[13px] md:text-[15px] leading-snug italic"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  transform: leftT,
                  willChange: "transform",
                }}
              >
                {role}
              </div>
              <div
                className="text-left text-[13px] md:text-[15px] leading-snug"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 400,
                  transform: rightT,
                  willChange: "transform",
                }}
              >
                {name}
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* ============ IMAGE LAYER — bottom-anchored portraits ============ */}
      {/* Portraits are absolute-positioned inside a section that has
          overflow-hidden, so anything spilling past the section edges is
          clipped. Aspect ratio is pinned to the sources' natural ratio
          (1728 × 2249) so height is always deterministic from width — no
          h-auto surprises when column width changes.
          Mobile uses % width to hug the layout (~170% of each column,
          shifted -85% so the img is centred on the column's outer edge).
          Desktop switches to fixed px width to avoid the 170%-of-640px
          runaway that would otherwise make each portrait ~1400px tall. */}
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 pointer-events-none z-[5]">
        <div
          className="relative"
          style={{ transform: leftT, willChange: "transform" }}
        >
          <img
            src="/gallery/ontrack.webp"
            alt=""
            draggable="false"
            className="absolute bottom-0 pointer-events-none select-none
                       left-[-85%] w-[170%] aspect-[1728/2249]
                       md:left-[8%] md:w-[360px]"
            style={{ maxWidth: "none" }}
          />
        </div>
        <div
          className="relative"
          style={{ transform: rightT, willChange: "transform" }}
        >
          <img
            src="/gallery/offtrack.webp"
            alt=""
            draggable="false"
            className="absolute bottom-0 pointer-events-none select-none
                       right-[-85%] w-[170%] aspect-[1728/2249]
                       md:right-[8%] md:w-[360px]"
            style={{ maxWidth: "none" }}
          />
        </div>
      </div>
    </section>
  );
}
