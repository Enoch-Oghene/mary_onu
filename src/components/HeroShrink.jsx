import { useEffect, useRef, useState } from "react";
import AnimatedTopo from "./AnimatedTopo.jsx";
import HeroTopoBackground from "./HeroTopoBackground.jsx";

const PORTRAIT = "/portraits/portrait_hero.webp";

// Ticker text — repeats across both rows, moves in opposite directions
const TICKER_A = "AT HOME WE DID IT ";
const TICKER_B = "A BRITISH GP WEEKEND I WILL REMEMBER FOREVER ";

const smoothstep = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a, b, t) => a + (b - a) * t;

// Seamless-loop ticker row: two identical inline blocks slide by -100% of their own width
function TickerRow({ text, speedSec, direction, className = "", style }) {
  const repeated = new Array(6).fill(text).join(" ");
  const anim = {
    animation: `ticker-${direction} ${speedSec}s linear infinite`,
  };
  return (
    <div
      className={`w-full overflow-hidden whitespace-nowrap ${className}`}
      style={style}
    >
      <div className="inline-flex">
        <div className="inline-block pr-8" style={anim}>
          {repeated}
        </div>
        <div className="inline-block pr-8" style={anim}>
          {repeated}
        </div>
      </div>
    </div>
  );
}

export default function HeroShrink() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1440,
    h: typeof window !== "undefined" ? window.innerHeight : 900,
  });

  // Scroll + resize wiring
  useEffect(() => {
    const onScroll = () => {
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const total = c.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const p = Math.max(0, Math.min(1, -rect.top / total));
      setProgress(p);
    };
    const onResize = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
      onScroll();
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Portrait tilt parallax — only when the hero is at rest at the top.
  // (The ripple + blurb behaviour that used to live here is now owned by
  // HeroTopoBackground, which distorts the contour lines directly instead
  // of overlaying a decorative ring.)
  useEffect(() => {
    if (progress > 0.03) return;
    const tiltFrom = (clientX, clientY) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const nx = (clientX - rect.left) / rect.width - 0.5;
      const ny = (clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty("--tilt-x", `${nx * 30}px`);
      hero.style.setProperty("--tilt-y", `${ny * 20}px`);
    };
    const onMouseMove = (e) => tiltFrom(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) tiltFrom(t.clientX, t.clientY);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [progress]);

  // ---- derived visual state from scroll progress ----
  const { w: W, h: H } = size;
  // End-of-scroll frame — a portrait 4:5 rectangle (matches the reference),
  // sized to about 62vh tall and 4/5 of that wide.
  const endH = Math.min(H * 0.62, 500);
  const endW = endH * 0.8;

  // Height shrinks earlier than width, so the frame becomes wide-landscape
  // before finally reshaping to a portrait rectangle.
  const hProg = smoothstep(Math.min(1, progress / 0.55));
  const wProg = smoothstep(Math.max(0, Math.min(1, (progress - 0.18) / 0.82)));
  const frameH = lerp(H, endH, hProg);
  const frameW = lerp(W, endW, wProg);

  // Portrait sizing — at rest (progress 0) the portrait is bottom-anchored
  // inside the frame with its natural aspect ratio, sized to about 92vh on
  // desktop and 65vh on mobile (matching the reference screenshots). As we
  // scroll, the portrait grows to fill the shrinking frame so the shrink
  // animation continues to work with object-cover face framing.
  const PORTRAIT_ASPECT = 976 / 675;
  const isMobile = W < 768;
  const initialPortraitH = isMobile
    ? Math.min(H * 0.65, 680)
    : Math.min(H * 0.92, 920);
  const initialPortraitW = initialPortraitH * PORTRAIT_ASPECT;
  // Grow the portrait to catch up with the frame within the first ~25% of
  // scroll; from there it tracks the shrinking frame 1:1.
  const fillProg = smoothstep(Math.min(1, progress / 0.25));
  const portraitH = lerp(initialPortraitH, frameH, fillProg);
  const portraitW = lerp(initialPortraitW, frameW, fillProg);

  // Layer opacities
  const oliveOpacity = smoothstep(Math.min(1, progress * 1.4));
  const tickerOpacity = smoothstep(Math.max(0, (progress - 0.18) * 2.1));
  const videoOpacity = 1 - Math.min(0.7, progress * 0.9);
  // Olive wash on the photo — matches the inactive tiles in the desktop menu.
  // Fades in as we approach the final frame so the photo tints down to the
  // olive background colour.
  const photoTintOpacity = smoothstep(Math.max(0, (progress - 0.35) * 1.8));

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "350vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-cream">
        {/* Base cream background (initial state) */}
        <div className="absolute inset-0 bg-cream" />

        {/* Animated topo background — hoisted out of the shrinking frame so
            it covers the full sticky container (100vh) instead of just the
            frame (which is window.innerHeight, and can be shorter than 100vh
            on mobile browsers where the URL bar makes the visible viewport
            smaller than the large one). Fades on scroll via videoOpacity;
            pauses once the hero has mostly shrunk away so we don't burn CPU
            while the olive+topo layer is doing the heavy lifting. */}
        <div className="absolute inset-0" style={{ opacity: videoOpacity }}>
          <HeroTopoBackground active={progress < 0.6} />
        </div>

        {/* Olive + animated topo — fades in as we scroll */}
        <div
          className="absolute inset-0"
          style={{ opacity: oliveOpacity, background: "#25281A" }}
        >
          <AnimatedTopo />
        </div>

        {/* Writeup — sits under the photo. Two rows with distinct
            typography: Poppins Light acid on top, Montserrat Bold white
            below, in line with the reference. */}
        <div
          className="absolute left-0 right-0 flex flex-col gap-[2px] pointer-events-none z-30"
          style={{
            top: `calc(50% + ${frameH / 2 + 28}px)`,
            opacity: tickerOpacity,
          }}
        >
          <TickerRow
            text={TICKER_A}
            speedSec={45}
            direction="left"
            className="text-[17px] md:text-[21px] leading-none tracking-wider text-acid"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300 }}
          />
          <TickerRow
            text={TICKER_B}
            speedSec={40}
            direction="right"
            className="text-[14px] md:text-[17px] leading-none tracking-wider text-white"
            style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}
          />
        </div>

        {/* SHRINKING HERO FRAME */}
        <div
          ref={heroRef}
          className="absolute overflow-hidden z-20 select-none"
          style={{
            width: frameW,
            height: frameH,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Vignette — a soft edge darkening to keep focus on the portrait.
              Stays tied to the frame so it shrinks along with it, providing
              a subtle spotlight around the portrait as the frame contracts. */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 65%, transparent 35%, rgba(0,0,0,0.18) 100%)",
              opacity: videoOpacity,
            }}
          />

          {/* Portrait — bottom-anchored inside the frame. At rest it has its
              natural aspect ratio (matching the reference screenshots); as we
              scroll it grows to fill the shrinking frame so object-cover with
              a face-focused objectPosition can crop to the head at the end. */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: portraitW,
              height: portraitH,
              left: "50%",
              bottom: 0,
              transform: "translateX(-50%)",
            }}
          >
            <img
              src={PORTRAIT}
              alt=""
              draggable="false"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: "50% 40%",
                transform: "translate(var(--tilt-x, 0px), var(--tilt-y, 0px))",
                transition: "transform 0.5s cubic-bezier(.2,.8,.2,1)",
              }}
            />
          </div>

          {/* Olive wash on the photo — same two-layer treatment as the
              inactive tiles in the desktop menu (multiply + color blend). */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(37,40,26,0.6) 0%, rgba(37,40,26,0.8) 100%)",
              mixBlendMode: "multiply",
              opacity: photoTintOpacity,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "rgba(50,60,30,0.35)",
              mixBlendMode: "color",
              opacity: photoTintOpacity,
            }}
          />
        </div>
      </div>
    </section>
  );
}
