import { ShoppingBag, Equal, X } from "lucide-react";

// ---------- LN halo (wireframe disc above head) ----------
export function LNHalo({ className = "" }) {
  return (
    <svg viewBox="0 0 200 80" className={className} aria-hidden>
      <defs>
        <radialGradient id="halo-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="url(#halo-fade)" strokeWidth="0.6">
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse
            key={`h-${i}`}
            cx="100"
            cy="40"
            rx={90 - i * 8}
            ry={16 - i * 1.4}
          />
        ))}
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i / 18) * Math.PI;
          const x1 = 100 + Math.cos(a) * 90;
          const y1 = 40 + Math.sin(a) * 16;
          const x2 = 100 - Math.cos(a) * 90;
          const y2 = 40 - Math.sin(a) * 16;
          return (
            <line
              key={`r-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#halo-fade)"
              strokeWidth="0.4"
            />
          );
        })}
      </g>
      <g transform="translate(85, 25)" fill="#0a0a0a">
        <path d="M 0 0 L 0 22 L 12 22 L 12 18 L 4 18 L 4 0 Z" />
        <path d="M 16 22 L 20 22 L 20 8 L 30 22 L 30 0 L 26 0 L 26 14 L 16 0 Z" />
      </g>
    </svg>
  );
}

// ---------- Wordmark — stacked (desktop top-left) ----------
export function Wordmark({ className = "" }) {
  return (
    <div className={`leading-[0.9] ${className}`}>
      <div className="text-[26px] tracking-tight text-black italic font-black font-serif">
        Madam Mary
      </div>
      <div className="text-[26px] font-black tracking-tight text-black -mt-0.5 font-sans">
        Onu Ogwo
      </div>
    </div>
  );
}

// ---------- Wordmark — inline (mobile centered under LN halo) ----------
export function WordmarkInline({ className = "" }) {
  return (
    <div
      className={`flex items-baseline gap-1.5 leading-none whitespace-nowrap ${className}`}
    >
      <span className="text-[23px] tracking-tight text-black italic font-black font-serif">
        Madam Mary
      </span>
      <span className="text-[23px] font-black tracking-tight text-black font-sans">
        Onu Ogwo
      </span>
    </div>
  );
}

// ---------- Store button ----------
export function StoreButton({ className = "" }) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 bg-acid text-black px-4 py-2.5 rounded-md hover:brightness-95 active:brightness-90 transition ${className}`}
    >
      <ShoppingBag size={16} strokeWidth={2.5} />
      <span className="text-xs font-black tracking-wider">GIVE</span>
    </button>
  );
}

// ---------- Menu button ----------
export function MenuButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className={`w-11 h-11 rounded-md flex items-center justify-center border border-black/15 bg-white/95 hover:bg-white transition text-black ${className}`}
    >
      <Equal size={22} strokeWidth={2.5} />
    </button>
  );
}

// ---------- Close button (used when menu is open) ----------
export function CloseButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close menu"
      className={`w-11 h-11 rounded-md flex items-center justify-center border border-black/15 bg-white/95 hover:bg-white transition text-black ${className}`}
    >
      <X size={20} strokeWidth={2.5} />
    </button>
  );
}
