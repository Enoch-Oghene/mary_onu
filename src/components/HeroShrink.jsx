import { useEffect, useRef, useState } from "react";
import HeroTopoBackground from "./HeroTopoBackground.jsx";

const PORTRAIT = "/portraits/portrait_hero.webp";

// Ticker text — repeats across both rows, moves in opposite directions
const TICKER_A =
  "Funeral Service — Time: 2:00 PM CST | 3:00 PM EST | 8:00 PM GMT+1 | 5:00 AM GMT+15 (next day), Zoom: 813 4434 7827, Passcode: MARY7626";
const TICKER_B =
  "Memorial Talk & Repas — Time: 4:30 PM CST | 5:30 PM EST | 10:30 PM GMT+1 | 7:30 AM GMT+15 (next day), Venue: Kingdom Hall of Jehovah's Witnesses, 16110 Chimney Rock Rd, Houston, TX 77053, Zoom: 810 375 0099, Passcode: SPO1914";

const smoothstep = (t) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const lerp = (a, b, t) => a + (b - a) * t;

// Seamless-loop ticker row: two identical inline blocks slide by -100% of their own width
function TickerRow({ text, speedSec, direction, className = "", style }) {
  // Repeat count scales inversely with source length so the total ticker
  // width — and therefore the visual scroll speed — stays roughly constant
  // no matter how short or long the text is. Short slogans get many
  // repeats to fill the viewport; long paragraphs get one, so they don't
  // fly across the screen unreadably fast.
  const repeat = Math.max(1, Math.ceil(120 / Math.max(1, text.length)));
  const repeated = new Array(repeat).fill(text).join(" ");
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
  // End-of-scroll frame — a portrait 4:5 rectangle sized so it always
  // leaves visible breathing room on every side. Constrained by BOTH
  // viewport dimensions: ≤78% of width (guarantees ~11% margin on each
  // side of the frame), ≤58% of height, and a hard 460px height cap —
  // whichever hits first. Narrow mobile viewports are width-limited
  // (that's what puts space on the left/right); desktop and tablet stay
  // height-limited (frame doesn't grow arbitrarily on tall screens).
  const endH = Math.min(H * 0.58, (W * 0.78) / 0.8, 460);
  const endW = endH * 0.8;

  // Uniform shrink: width and height contract together on the same curve so
  // the frame stays a clean rectangle throughout the scroll and just becomes
  // more portrait-oriented as it approaches the end. Completes by ~progress
  // 0.8, leaving the final ~20% for the tint / marquee to finish settling.
  const shrinkProg = smoothstep(Math.min(1, progress / 0.8));
  const frameH = lerp(H, endH, shrinkProg);
  const frameW = lerp(W, endW, shrinkProg);

  // Portrait sizing — at rest (progress 0) the portrait is bottom-anchored
  // inside the frame with its natural aspect ratio (~65vh on mobile, ~92vh
  // on desktop) to match the reference. During scroll it must NEVER grow —
  // only shrink. Clamp its dimensions to their initial values so the frame
  // does the shrinking on its own; once the frame contracts below the
  // portrait's initial size, the portrait starts tracking the frame 1:1.
  const PORTRAIT_ASPECT = 976 / 675;
  const isMobile = W < 768;
  const initialPortraitH = isMobile
    ? Math.min(H * 0.65, 680)
    : Math.min(H * 0.92, 920);
  const initialPortraitW = initialPortraitH * PORTRAIT_ASPECT;
  const portraitH = Math.min(initialPortraitH, frameH);
  const portraitW = Math.min(initialPortraitW, frameW);

  // Layer opacities
  // videoOpacity fades the hero's own cream/topo bg fully out during the
  // shrink, so the static SharedBackground olive+topo (rendered globally
  // in App.jsx at position:fixed) becomes the "green" end state seen in
  // frames 4–6. Small dead-zone at the start (progress ≤ 0.05) keeps the
  // opacity locked at 1 so tiny scroll-wobble at rest can't briefly leak
  // the olive through the cream — same defensive intent the previous
  // opaque bg-white div served.
  const videoOpacity = 1 - smoothstep(Math.max(0, (progress - 0.05) / 0.6));
  const tickerOpacity = smoothstep(Math.max(0, (progress - 0.18) * 2.1));
  // Olive wash on the photo — matches the inactive tiles in the desktop menu.
  // Fades in as we approach the final frame so the photo tints down to the
  // olive background colour.
  const photoTintOpacity = smoothstep(Math.max(0, (progress - 0.35) * 1.8));

  return (
    <section
      ref={containerRef}
      className="relative"
      style={{ height: "140vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Hero cream stack — the white base + interactive topo canvas
            fade together with scroll. As they clear, the static
            SharedBackground (fixed to viewport in App.jsx) shows
            through, becoming the olive "green" end state of the hero.
            Nothing here provides the olive itself — that lives in
            SharedBackground so it never moves. */}
        <div className="absolute inset-0" style={{ opacity: videoOpacity }}>
          <div className="absolute inset-0 bg-white" />
          <HeroTopoBackground active={progress < 0.6} />
        </div>

        {/* Writeup — sits under the photo. Two rows with distinct
            typography: Poppins Light acid on top, Montserrat Bold white
            below, in line with the reference. */}
        <div
          className="absolute left-0 right-0 flex flex-col gap-0 pointer-events-none z-30"
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
            style={{ fontFamily: "'Anton', sans-serif", fontWeight: 500 }}
          />
          <TickerRow
            text={TICKER_B}
            speedSec={40}
            direction="right"
            className="text-[14px] md:text-[17px] leading-none tracking-wider text-white"
            style={{ fontFamily: "'Anton', sans-serif", fontWeight: 700 }}
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
