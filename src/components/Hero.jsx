import { useEffect, useRef, useState } from "react";

const BG_VIDEO = "/bg_video.mp4";
const PORTRAIT = "/portraits/portrait_hero.webp";
const PORTRAIT_RATIO = 976 / 675;

const RIPPLE_LIFETIME_MS = 1400;      // must match the CSS animation duration
const RIPPLE_MIN_INTERVAL_MS = 70;    // don't spawn ripples faster than this
const RIPPLE_MIN_DISTANCE_PX = 20;    // and only after this much cursor travel

export default function Hero({ locked = false }) {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const rippleIdRef = useRef(0);
  const lastRippleRef = useRef({ time: 0, x: -1000, y: -1000 });
  const [ripples, setRipples] = useState([]);

  // Nudge autoplay for stricter browsers
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (locked) return; // when locked, don't track cursor or spawn ripples

    const spawnFrom = (clientX, clientY, force = false) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      // Portrait parallax via CSS custom properties (no re-render)
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      hero.style.setProperty("--tilt-x", `${nx * 30}px`);
      hero.style.setProperty("--tilt-y", `${ny * 20}px`);

      const now = performance.now();
      const last = lastRippleRef.current;
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.hypot(dx, dy);

      if (
        force ||
        (now - last.time >= RIPPLE_MIN_INTERVAL_MS &&
          dist >= RIPPLE_MIN_DISTANCE_PX)
      ) {
        const id = rippleIdRef.current++;
        setRipples((prev) => [...prev, { id, x, y }]);
        lastRippleRef.current = { time: now, x, y };
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, RIPPLE_LIFETIME_MS);
      }
    };

    const onMouseMove = (e) => spawnFrom(e.clientX, e.clientY);
    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (t) spawnFrom(t.clientX, t.clientY, true); // always spawn on tap
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) spawnFrom(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [locked]);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-screen overflow-hidden select-none bg-cream"
      style={{ "--tilt-x": "0px", "--tilt-y": "0px" }}
    >
      {/* FULL-SCREEN CLOUD VIDEO */}
      <video
        ref={videoRef}
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 65%, transparent 35%, rgba(0,0,0,0.18) 100%)",
        }}
      />

      {/* CURSOR / TOUCH RIPPLES */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="ripple absolute pointer-events-none z-20 rounded-full"
          style={{
            left: r.x - 60,
            top: r.y - 60,
            width: 120,
            height: 120,
          }}
        />
      ))}

      {/* PORTRAIT — responsive sizing */}
      <div
        className="absolute bottom-0 left-1/2 z-30 pointer-events-none
                   h-[65vh] max-h-[680px] aspect-[976/675]
                   md:h-[92vh] md:max-h-[920px]"
        style={{
          transform:
            "translateX(-50%) translate(var(--tilt-x, 0px), var(--tilt-y, 0px))",
          transition: "transform 0.5s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <img
          src={PORTRAIT}
          alt=""
          draggable="false"
          className="absolute inset-0 w-full h-full object-contain object-bottom"
          style={{
            filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.35))",
          }}
        />
      </div>
    </section>
  );
}
