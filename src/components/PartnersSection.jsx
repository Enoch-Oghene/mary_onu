// PartnersSection.jsx
//
// Section that follows ChampionSection. Content-only — the cream+topo
// background is provided by a SHARED layer in App.jsx that lives behind
// both this section and ChampionSection, so the two sections read as one
// continuous scrolling surface rather than two adjacent panels with their
// own separate topo canvases.
//
//   • Left column  : "PARTNERS" (Inter Black, olive) stacked over
//                    "&CAMPAIGNS" (Playfair Display italic, olive).
//   • Right column : short intro paragraph in olive, Inter regular.

const OLIVE = "#25281A";

export default function PartnersSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ color: OLIVE, height: "55vh" }}
    >
      {/* Content grid — heading left, body right. No section background
          on purpose; the shared cream+topo layer in App.jsx shows through.
          Top padding kept small so this content sits close to the last
          line of ChampionSection above. */}
      <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-8 px-6 md:px-10 pt-20 md:pt-24 h-full">
        {/* Left — PARTNERS / &CAMPAIGNS stack */}
        <div className="flex flex-col">
          <div
            className="text-[14px] md:text-[22px] leading-[0.95] tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
          >
            PARTNERS
          </div>
          <div
            className="text-[14px] md:text-[22px] leading-[1.02] italic mt-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontStyle: "italic",
            }}
          >
            &CAMPAIGNS
          </div>
        </div>

        {/* Right — intro paragraph */}
        <div className="flex flex-col">
          <p
            className="text-[13px] md:text-[15px] leading-[1.5]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Lando is proud to collaborate with a range of partners, who share
            his passion for performance across a range of industries.
          </p>
        </div>
      </div>
    </section>
  );
}
