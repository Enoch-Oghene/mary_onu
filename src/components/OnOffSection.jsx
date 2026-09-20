// OnOffSection.jsx
//
// Two-column split section that appears after the gallery.
//
// Layout matches the reference exactly:
//   • Left column ("ON TRACK") — all content RIGHT-aligned, i.e. flush to
//     the column's inner (right) edge so it faces the middle of the screen.
//   • Right column ("OFF TRACK") — all content LEFT-aligned, flush to the
//     column's inner (left) edge, again facing the middle.
//   • The two TRACK words sit inward, near each other in the middle, with
//     the "ON"/"OFF" labels above each and the descriptions + arrow
//     buttons below, all obeying the same inner-alignment.
//   • Half portraits at the bottom extend past the OUTER edges of the
//     screen (left image past the left, right image past the right).
//
// As the section scrolls into view the two columns slide in from the
// outside edges of the screen and settle in place.
//
// Background is a static olive-tint topo canvas pinned to the viewport —
// same treatment as the cream half of the gallery, so nothing about the
// background moves with the content.

import { useEffect, useRef, useState } from "react";

function HookArrow({ mirror = false, className = "" }) {
  const d = mirror
    ? "M 20 6 L 20 12 Q 20 17 15 17 L 5 17 M 5 17 L 10 12 M 5 17 L 10 22"
    : "M 4 6 L 4 12 Q 4 17 9 17 L 19 17 M 19 17 L 14 12 M 19 17 L 14 22";
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
      <path d={d} />
    </svg>
  );
}

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
  const leftShift = `${(p - 1) * 100}%`;
  const rightShift = `${(1 - p) * 100}%`;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ color: OLIVE, height: "100vh" }}
    >
      {/* Background intentionally omitted — the shared static background
          in App.jsx provides the cream + topo canvas that shows through. */}

      <div className="relative z-10 grid grid-cols-2 h-full">
        {/* ============ LEFT — ON TRACK (all RIGHT-aligned) ============ */}
        <div
          className="relative flex flex-col pl-2 pr-3 md:pr-4 pt-20 md:pt-28 h-full"
          style={{
            transform: `translateX(${leftShift})`,
            willChange: "transform",
          }}
        >
          {/* Heading (no scribble) */}
          <div className="relative w-full">
            <div
              className="text-right text-[13px] md:text-[20px] italic leading-none pr-1"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
              }}
            >
              ON
            </div>
            <div
              className="text-right text-[28px] md:text-[46px] leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
            >
              TRACK
            </div>
          </div>

          {/* Description */}
          <p
            className="mt-4 text-right text-[13px] md:text-[15px] leading-snug italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Latest recent results, career stats and photos from trackside.
          </p>

          {/* Acid button */}
          <div className="mt-4 flex justify-end">
            <button
              className="w-10 h-10 md:w-11 md:h-11 rounded-md flex items-center justify-center"
              style={{ background: "#CCFF33", color: OLIVE }}
              aria-label="On track"
            >
              <HookArrow className="w-5 h-5" />
            </button>
          </div>

          {/* Half image — flex-1 gives it the remaining space; image is
              absolute bottom-0 within it, extending past the left edge.
              Half of the image spills off past the outer edge (offset =
              width / 2), scaled slightly down from the 200%/-100% baseline. */}
          <div className="relative flex-1 mt-4">
            <img
              src="/gallery/ontrack.webp"
              alt=""
              draggable="false"
              className="absolute bottom-0 h-auto pointer-events-none select-none"
              style={{
                left: "-85%",
                width: "170%",
                maxWidth: "none",
              }}
            />
          </div>
        </div>

        {/* ============ RIGHT — OFF TRACK (all LEFT-aligned) ============ */}
        <div
          className="relative flex flex-col pr-2 pl-3 md:pl-4 pt-20 md:pt-28 h-full"
          style={{
            transform: `translateX(${rightShift})`,
            willChange: "transform",
          }}
        >
          <div className="relative w-full">
            <div
              className="text-left text-[13px] md:text-[20px] italic leading-none pl-1"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 400,
              }}
            >
              OFF
            </div>
            <div
              className="text-left text-[28px] md:text-[46px] leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
            >
              TRACK
            </div>
          </div>

          <p
            className="mt-4 text-left text-[13px] md:text-[15px] leading-snug italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Campaigns, shoots and other such promotional materials for fans
          </p>

          <div className="mt-4 flex justify-start">
            <button
              className="w-10 h-10 md:w-11 md:h-11 rounded-md flex items-center justify-center"
              style={{ background: "#CCFF33", color: OLIVE }}
              aria-label="Off track"
            >
              <HookArrow mirror className="w-5 h-5" />
            </button>
          </div>

          <div className="relative flex-1 mt-4">
            <img
              src="/gallery/offtrack.webp"
              alt=""
              draggable="false"
              className="absolute bottom-0 h-auto pointer-events-none select-none"
              style={{
                right: "-85%",
                width: "170%",
                maxWidth: "none",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
