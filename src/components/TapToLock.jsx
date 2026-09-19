import { Pointer } from "lucide-react";

export default function TapToLock({ locked, onToggle, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="text-[10px] tracking-[0.3em] font-bold text-white/85 mix-blend-difference select-none"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {locked ? "TAP TO UNLOCK" : "TAP TO LOCK"}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={locked ? "Unlock interaction" : "Lock interaction"}
        aria-pressed={locked}
        className={`w-11 h-11 rounded-md flex items-center justify-center transition
          ${locked
            ? "bg-white/95 border border-black/15 text-black"
            : "bg-acid text-black hover:brightness-95 active:brightness-90"
          }`}
      >
        <Pointer size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
