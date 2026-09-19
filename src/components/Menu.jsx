import { useState } from "react";
import AnimatedTopo from "./AnimatedTopo.jsx";

// Each nav item is paired with one of the 4 photos. Hovering the item
// makes the paired photo un-tint ("come alive"), and lifts the label.
const NAV = [
  { label: "HOME",      photoIdx: 0 },
  { label: "ON TRACK",  photoIdx: 1 },
  { label: "OFF TRACK", photoIdx: 2 },
  { label: "CALENDAR",  photoIdx: 3 },
];

const PHOTOS = {
  0: "/menu/menu_1.webp",
  1: "/menu/menu_2.webp",
  2: "/menu/menu_3.webp",
  3: "/menu/menu_4.webp",
};

function TintedTile({ src, active }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black rounded-sm">
      <img
        src={src}
        alt=""
        draggable="false"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        style={{ transform: active ? "scale(1.03)" : "scale(1)" }}
      />
      {/* olive-green wash — fades out when active */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(180deg, rgba(37,40,26,0.6) 0%, rgba(37,40,26,0.8) 100%)",
          mixBlendMode: "multiply",
          opacity: active ? 0 : 1,
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "rgba(50,60,30,0.35)",
          mixBlendMode: "color",
          opacity: active ? 0 : 1,
        }}
      />
    </div>
  );
}

export default function Menu({ open, onClose }) {
  const [hoveredColumn, setHoveredColumn] = useState(null);
  // HOME is selected by default when the menu opens — so photo 0 stays "alive"
  const [activePhoto, setActivePhoto] = useState(0);

  if (!open) return null;

  const leftShift =
    hoveredColumn === 0 ? -40 : hoveredColumn === 1 ? 40 : 0;
  const rightShift =
    hoveredColumn === 1 ? -40 : hoveredColumn === 0 ? 40 : 0;

  const columnTransition = "transform 0.7s cubic-bezier(.2,.8,.2,1)";

  return (
    <div
      className="fixed inset-0 z-[55] overflow-hidden select-none"
      style={{ background: "#25281A", color: "#EFEBDE" }}
      role="dialog"
      aria-modal="true"
    >
      {/* Animated topographic background — flowing sine-wave lines on canvas */}
      <AnimatedTopo />

      {/* ==================== DESKTOP LAYOUT ==================== */}
      <div className="hidden md:flex h-full relative z-10">
        {/* LEFT — two staggered photo columns */}
        <div className="w-1/2 h-full px-4 flex gap-5 overflow-hidden">
          {/* Left column — extends beyond top and bottom edges */}
          <div
            className="flex-1 flex flex-col gap-8"
            onMouseEnter={() => setHoveredColumn(0)}
            onMouseLeave={() => setHoveredColumn(null)}
            style={{
              marginTop: "-3vh",
              transform: `translateY(${leftShift}px)`,
              transition: columnTransition,
            }}
          >
            <div style={{ height: "60vh" }}>
              <TintedTile src={PHOTOS[0]} active={activePhoto === 0} />
            </div>
            <div style={{ height: "52vh" }}>
              <TintedTile src={PHOTOS[2]} active={activePhoto === 2} />
            </div>
          </div>

          {/* Right column — offset down, sits inside the viewport */}
          <div
            className="flex-1 flex flex-col gap-8"
            onMouseEnter={() => setHoveredColumn(1)}
            onMouseLeave={() => setHoveredColumn(null)}
            style={{
              marginTop: "8vh",
              transform: `translateY(${rightShift}px)`,
              transition: columnTransition,
            }}
          >
            <div style={{ height: "42vh" }}>
              <TintedTile src={PHOTOS[1]} active={activePhoto === 1} />
            </div>
            <div style={{ height: "42vh" }}>
              <TintedTile src={PHOTOS[3]} active={activePhoto === 3} />
            </div>
          </div>
        </div>

        {/* RIGHT — nav */}
        <div className="w-1/2 h-full flex flex-col items-center justify-center px-8">
          <nav className="flex flex-col items-center gap-5">
            {NAV.map((item) => {
              const isActive = activePhoto === item.photoIdx;
              return (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => setActivePhoto(item.photoIdx)}
                  onMouseLeave={() => setActivePhoto(0)}
                  className="text-5xl lg:text-6xl font-black tracking-tight leading-none font-sans transition-all duration-300 ease-out"
                  style={{
                    color: isActive ? "#CCFF33" : "#FFFFFF",
                    transform: isActive ? "translateY(-8px)" : "translateY(0)",
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ==================== MOBILE LAYOUT ==================== */}
      <div className="md:hidden h-full flex flex-col items-center justify-center px-6 relative z-10">
        <nav className="flex flex-col items-center gap-5">
          {NAV.map((item, i) => {
            const isActive = activePhoto === item.photoIdx;
            return (
              <button
                key={item.label}
                type="button"
                onTouchStart={() => setActivePhoto(item.photoIdx)}
                className="text-[42px] font-black tracking-tight leading-none font-sans transition-all duration-300 ease-out"
                style={{
                  color: isActive ? "#CCFF33" : "#FFFFFF",
                  transform: isActive ? "translateY(-6px)" : "translateY(0)",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
