// Menu.jsx
//
// Full-screen menu overlay. Single mobile layout — the site is mobile-
// only regardless of viewport (see tailwind.config.js / App.jsx), so
// this component intentionally has no desktop code path.
//
// Three nav items, each a smooth-scroll link to a section on the page.
// Selecting a nav item scrolls the section into view and closes the
// menu in one action.

import AnimatedTopo from "./AnimatedTopo.jsx";

const NAV = [
  { label: "PROGRAM OF SERVICE", targetId: "program-of-service" },
  { label: "LIFE TRIBUTE", targetId: "life-tribute" },
  { label: "MEMORIES IN PICTURES", targetId: "memories" },
];

export default function Menu({ open, onClose }) {
  if (!open) return null;

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Close the menu on the next tick so the scroll can commit before
    // the overlay unmounts — otherwise `scrollIntoView` may target an
    // element that's just been made hidden/removed under some engines.
    setTimeout(() => onClose(), 0);
  };

  return (
    <div
      className="fixed inset-0 z-[55] overflow-hidden select-none"
      style={{ background: "#25281A", color: "#EFEBDE" }}
      role="dialog"
      aria-modal="true"
    >
      {/* Animated topographic background — flowing sine-wave lines on canvas */}
      <AnimatedTopo />

      {/* Nav — centred, stacked. Same visual treatment across viewports. */}
      <div className="h-full flex flex-col items-center justify-center px-6 relative z-10">
        <nav className="flex flex-col items-center gap-6">
          {NAV.map((item) => (
            <button
              key={item.targetId}
              type="button"
              onClick={() => go(item.targetId)}
              className="text-[32px] font-black tracking-tight leading-[1.05] text-center font-sans transition-transform duration-200 ease-out active:scale-95"
              style={{
                color: "#FFFFFF",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
