// HelmetsSection.jsx
//
// Full-viewport section that follows OnOffSection. It scrolls into view
// naturally from below as the user continues down the page.
//
// Layout matches the reference exactly:
//   • Top ~60% of the viewport — a hero photo, edge-to-edge, cover-fitted.
//   • Bottom ~40% — a black panel with a two-column grid:
//       – Left  : "HELMETS" (Inter Black, cream)
//                 "HALL OF FAME" (Playfair Display italic, acid green)
//                 Same typographic pairing used by the LANDO NORRIS wordmark
//                 and the LegacySection writeup.
//       – Right : short intro paragraph in cream, Inter regular.
//
// No special scroll wiring is needed — the section is 100vh and sits after
// OnOffSection in the App flow, so the natural page scroll produces the
// "gradually scrolls up" reveal shown in the reference.

const OLIVE = "#25281A";
const PHOTO = "/gallery/helmets.webp";

export default function HelmetsSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", background: OLIVE }}
    >
      {/* ============ TOP — Hero photo ============ */}
      <div className="relative w-full" style={{ height: "60%" }}>
        <img
          src={PHOTO}
          alt=""
          draggable="false"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>

      {/* ============ BOTTOM — Black text panel ============ */}
      <div
        className="relative w-full grid grid-cols-2 gap-5 md:gap-10 px-5 md:px-10 py-6 md:py-10"
        style={{ height: "40%", color: "#EFEBDE" }}
      >
        {/* Title stack — HELMETS (sans black) over HALL OF FAME (serif italic acid) */}
        <div className="flex flex-col justify-start">
          <div
            className="text-cream text-[18px] md:text-[32px] leading-[0.95] tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
          >
            HELMETS
          </div>
          <div
            className="text-acid text-[16px] md:text-[28px] leading-[1.02] mt-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontStyle: "italic",
            }}
          >
            HALL OF FAME
          </div>
        </div>

        {/* Body copy — right column */}
        <div className="flex items-start">
          <p
            className="text-cream text-[11px] md:text-[13px] leading-[1.4]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            From his iconic blobs to innovative one-off designs, Lando has
            always been passionate about designing innovative and memorable
            helmets.
          </p>
        </div>
      </div>
    </section>
  );
}
