// GallerySection.jsx
//
// One long continuous surface that carries everything after the hero:
// the mixed-typography writeup ("REDEFINING LIMITS…"), then the nine
// staggered photos and two quotes.
//
// Background: two solid colour layers (olive underneath, cream on top)
// pinned to the viewport so they never scroll. The cream layer's opacity
// is driven by scroll position — it starts fading in about a viewport
// before the fifth photo appears and finishes about a viewport after —
// so the colour drift happens across ~120vh of scroll with no visible
// hand-off point. The topo canvas is pinned in the same viewport layer
// so its contour lines animate in place instead of moving with content.

import { useEffect, useRef, useState } from "react";
import AnimatedTopo from "./AnimatedTopo.jsx";

// ---- Writeup typography -----------------------------------------------------
const acidStyle = {
  fontFamily: "'Playfair Display', serif",
  fontWeight: 900,
  fontStyle: "italic",
};
const creamStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 900,
};
function Acid({ children }) {
  return (
    <span className="text-acid" style={acidStyle}>
      {children}
    </span>
  );
}
function Cream({ children }) {
  return (
    <span className="text-cream" style={creamStyle}>
      {children}
    </span>
  );
}

// ---- Gallery bits -----------------------------------------------------------
const CAPTION_STYLE = { fontFamily: "'Inter', sans-serif" };
const QUOTE_STYLE = { fontFamily: "'Playfair Display', serif" };

function Caption({ children }) {
  return (
    <div
      className="text-[10px] tracking-[0.22em] font-bold mb-2 opacity-90"
      style={CAPTION_STYLE}
    >
      {children}
    </div>
  );
}

function Photo({
  src,
  caption,
  align = "left",
  widthClass = "w-3/5",
  offset = "",
  inactive = false,
  rotate = 0,
}) {
  const self = align === "right" ? "self-end" : "self-start";
  const rotated = rotate !== 0;
  return (
    <div className={`${widthClass} ${self} ${offset}`}>
      <Caption>{caption}</Caption>
      <div
        className="relative w-full overflow-hidden"
        style={rotated ? { aspectRatio: "3 / 4" } : undefined}
      >
        {rotated ? (
          // Rotated: img is centred and scaled by 4/3 so that the 4:3
          // landscape source, spun into a 3:4 portrait, still fills the
          // portrait container exactly (no letterboxing, no gaps).
          <img
            src={src}
            alt=""
            loading="lazy"
            draggable="false"
            className="absolute w-full h-auto select-none"
            style={{
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(1.3333)`,
              transformOrigin: "center center",
            }}
          />
        ) : (
          <img
            src={src}
            alt=""
            loading="lazy"
            draggable="false"
            className="w-full h-auto block select-none"
          />
        )}
        {/* When inactive, paint the same two-layer olive wash the menu
            uses on non-selected tiles: a dark olive multiply gradient
            plus a low-sat color-blend tint that desaturates the image. */}
        {inactive && (
          <>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(37,40,26,0.6) 0%, rgba(37,40,26,0.8) 100%)",
                mixBlendMode: "multiply",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "rgba(50,60,30,0.35)",
                mixBlendMode: "color",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Signature({ className = "" }) {
  return (
    <svg viewBox="0 0 130 26" className={`w-24 h-5 ${className}`} aria-hidden>
      <path
        d="M 4 16 C 10 4, 20 20, 28 12 S 44 4, 52 16 S 68 20, 74 10 S 88 4, 96 16 L 122 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Quote({ text, align = "left", widthClass = "w-3/5", offset = "" }) {
  const self = align === "right" ? "self-end" : "self-start";
  return (
    <div className={`${widthClass} ${self} ${offset}`}>
      <p
        className="text-[19px] md:text-[24px] leading-[1.2] italic"
        style={QUOTE_STYLE}
      >
        {text}
      </p>
      <Signature className="text-acid mt-3" />
    </div>
  );
}

// -----------------------------------------------------------------------------

export default function GallerySection() {
  const OLIVE = "#25281A";
  const CREAM = "#EFEBDE";

  // Pick 3 of the 9 photos (indices 0..8) to display with the menu's
  // inactive-tile treatment. Selection is randomised once on mount so
  // it doesn't reshuffle on every render.
  const [tintedIndices] = useState(() => {
    const idxs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
    }
    return new Set(idxs.slice(0, 3));
  });
  const isTinted = (i) => tintedIndices.has(i);

  // Marker sits in the DOM between photo 4 and photo 5. A scroll listener
  // maps its viewport position to a cream-opacity value: fade begins when
  // the marker enters the lower part of the viewport and completes about
  // a viewport after it has scrolled past the top — a ~120vh scroll
  // range, so the palette drift feels seamless with no visible cut-over.
  const markerRef = useRef(null);
  const [creamAmount, setCreamAmount] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const marker = markerRef.current;
      if (!marker) return;
      const rect = marker.getBoundingClientRect();
      const vh = window.innerHeight || 1;
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
    <section className="relative">
      {/* Pinned background stack — the olive base is always there, the
          cream overlay's opacity is driven by scroll, and the topo
          canvas sits above both. Because everything lives inside one
          sticky, viewport-sized container, none of it scrolls with the
          page: only its colour drifts. Negative bottom margin removes
          the sticky element from layout so the content flows over it. */}
      <div
        className="pointer-events-none z-0"
        aria-hidden
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          marginBottom: "-100vh",
        }}
      >
        {/* Olive base */}
        <div className="absolute inset-0" style={{ background: OLIVE }} />
        {/* Cream overlay — fades in with scroll */}
        <div
          className="absolute inset-0"
          style={{ background: CREAM, opacity: creamAmount }}
        />
        {/* Topo lines: fixed olive-family tint that reads as a light
            tone-in-tone on the olive half and a soft dusty tint on the
            cream half — no white, no adaptive blending. */}
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

      <div className="relative z-10 flex flex-col">
        {/* ============ WRITEUP (was LegacySection) ============ */}
        <div
          className="min-h-screen flex flex-col items-center justify-center px-6 py-16 md:py-32"
          style={{ color: "#EFEBDE" }}
        >
          <div className="max-w-4xl text-center leading-[1.05] tracking-tight text-[24px] md:text-[68px]">
            <Acid>REDEFINING</Acid> <Cream>LIMITS,</Cream>
            <br className="md:hidden" /> <Cream>FIGHTING FOR</Cream>
            <br className="md:hidden" /> <Acid>WINS</Acid>
            <Cream>, BRINGING IT</Cream>
            <br className="md:hidden" /> <Cream>ALL IN ALL WAYS.</Cream>
            <br className="md:hidden" /> <Cream>DEFINING A</Cream>{" "}
            <Acid>LEGACY</Acid>
            <br className="md:hidden" /> <Cream>IN FORMULA 1 ON</Cream>
            <br className="md:hidden" /> <Cream>AND OFF THE</Cream>
            <br className="md:hidden" /> <Cream>TRACK.</Cream>
          </div>
        </div>

        {/* ============ PHOTO STACK ============ */}
        <div className="max-w-lg mx-auto px-6 pt-4 pb-20 md:pt-8 md:pb-32 flex flex-col w-full">
          {/* -------- olive half -------- */}
          <div className="flex flex-col" style={{ color: "#EFEBDE" }}>
            <Photo
              caption="QATAR, 2024"
              src="/gallery/g01.jpg"
              align="left"
              widthClass="w-3/5"
              inactive={isTinted(0)}
            />
            <Photo
              caption="FIA PRIZE GIVING, 2024"
              src="/gallery/g02.jpg"
              align="right"
              widthClass="w-1/2"
              offset="mt-14"
              inactive={isTinted(1)}
            />
            <Photo
              caption="MIAMI GP, 2024"
              src="/gallery/g03.jpg"
              align="left"
              widthClass="w-3/5"
              offset="mt-16"
              inactive={isTinted(2)}
              rotate={-90}
            />
            <Quote
              text={
                '"It doesn\u2019t matter where you start, it\u2019s how you progress from there."'
              }
              align="left"
              widthClass="w-3/5"
              offset="mt-10"
            />
            <Photo
              caption="BRITAIN, 2025"
              src="/gallery/g04.jpg"
              align="right"
              widthClass="w-3/5"
              offset="mt-16"
              inactive={isTinted(3)}
            />
          </div>

          {/* Breathing room between photo groups. The scroll marker
              sits here — its viewport position drives the cream fade,
              so by the time the second-half photos are on screen the
              bg is far enough into cream for their darker text to read. */}
          <div ref={markerRef} className="h-24 md:h-32" />

          {/* -------- second half of photos (bg has faded to cream) -------- */}
          <div className="flex flex-col" style={{ color: "#25281A" }}>
            <Photo
              caption="BATTERSEA, 2024"
              src="/gallery/g05.jpg"
              align="right"
              widthClass="w-3/5"
              inactive={isTinted(4)}
            />
            <Photo
              caption="HIGH PERFORMANCE GALA, 2024"
              src="/gallery/g06.jpg"
              align="right"
              widthClass="w-1/2"
              offset="mt-16"
              inactive={isTinted(5)}
            />
            <Photo
              caption="BARCELONA, 2024"
              src="/gallery/g07.jpg"
              align="left"
              widthClass="w-3/5"
              offset="mt-16"
              inactive={isTinted(6)}
            />
            <Quote
              text={
                '"Since I was 7 years old and had my first experience with kart racing, I\u2019ve worked tirelessly to make that dream come true."'
              }
              align="left"
              widthClass="w-3/5"
              offset="mt-10"
            />
            <Photo
              caption="AUSTRIA, 2020"
              src="/gallery/g08.jpg"
              align="right"
              widthClass="w-3/5"
              offset="mt-14"
              inactive={isTinted(7)}
              rotate={-90}
            />
            <Photo
              caption="US, 2024"
              src="/gallery/g09.jpg"
              align="left"
              widthClass="w-3/5"
              offset="mt-16"
              inactive={isTinted(8)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
