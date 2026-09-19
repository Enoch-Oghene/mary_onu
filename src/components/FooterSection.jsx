// FooterSection.jsx
//
// Final section of the page. Two visual layers:
//
//   1. A LIME-GREEN top band (gradient from the cream above, settling on
//      a saturated lime). This is the "different colour scheme" that
//      demarcates the footer from the album — the shared cream+topo
//      background above ends, and the footer opens on lime.
//
//   2. A DARK, near-black-olive rounded CARD that floats inside the lime
//      band. The card carries all the content and reads as a distinct
//      object over the lime backdrop. A small pill-shaped "notch" at the
//      top-centre of the card is coloured the same lime as the band,
//      so it appears as a subtle indent cut into the top edge — the
//      "border" detail in the reference.
//
// Card contents (all centred), top to bottom:
//   - Sponsor row (Google, Ralph Lauren, Android, TUMI, PURE ELECTRIC,
//     Monster, Hilton, McLaren) — horizontally scrollable.
//   - PAGES + FOLLOW ON — two tight columns centred as a pair.
//   - STORE — single acid word.
//   - Signature "Lando" — tilted acid italic serif.
//   - Tagline "ALWAYS / BRIN⋯THE" with the transparent-bg portrait
//     dead-centre, tucked in front of the middle of the tagline.
//   - BUSINESS ENQUIRIES button (acid).
//   - Copyright bar.

import AnimatedTopo from "./AnimatedTopo.jsx";

const DARK = "#181B0E";
const OLIVE = "#25281A";
const CREAM = "#EFEBDE";
const ACID = "#CCFF33";
// Saturated lime the band settles on (and the notch inherits so it blends
// with the surrounding band cleanly).
const LIME = "#DDF07C";
const MUTED_CREAM = "rgba(239, 235, 222, 0.55)";
const MUTED_OLIVE = "rgba(190, 210, 130, 0.30)";

const PHOTO = "/gallery/ontrack.webp";

const SPONSORS = [
  "Google",
  "RALPH LAUREN",
  "Android",
  "TUMI",
  "PURE ELECTRIC",
  "Monster",
  "Hilton",
  "McLaren",
];
const PAGES = ["HOME", "ON TRACK", "OFF TRACK", "CALENDAR"];
const SOCIAL = ["TIKTOK", "INSTAGRAM", "YOUTUBE", "TWITCH"];

function HookArrow({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M 4 6 L 4 12 Q 4 17 9 17 L 19 17 M 19 17 L 14 12 M 19 17 L 14 22" />
    </svg>
  );
}

export default function FooterSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        // Cream at the very top blends into the album's cream+topo above,
        // then quickly settles on saturated lime for the rest of the band.
        background:
          "linear-gradient(to bottom, #EFEBDE 0%, #DDF07C 22%, #DDF07C 100%)",
      }}
    >
      {/* Lime "runway" above the card — the height determines how much
          lime the user sees before the dark card begins. */}
      <div className="h-24 md:h-36" />

      {/* Card wrapper — relative so the NOTCH can absolutely position
          itself against the card's top edge. */}
      <div className="relative mx-3 md:mx-4">
        {/* NOTCH — a shallow pill in the lime colour, positioned so half
            sits above the dark card (invisible against the lime band) and
            half sits below (visible as a lime indent cut into the card).
            z-20 keeps it above the card body. */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 90,
            height: 28,
            background: LIME,
            borderRadius: 9999,
          }}
          aria-hidden
        />

        {/* Dark rounded CARD — carries every piece of content. */}
        <div
          className="relative overflow-hidden"
          style={{
            background: DARK,
            color: CREAM,
            borderRadius: 36,
          }}
        >
          {/* Subtle topo lines behind the content. */}
          <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <AnimatedTopo
              bg={null}
              lineColor="rgba(120, 130, 90, 0.14)"
              strokeWidth={1}
              numBlobs={6}
              numLevels={4}
              levelStart={0.2}
              levelStep={0.35}
            />
          </div>

          <div className="relative z-10">
            {/* 1. Sponsor row */}
            <div className="pt-10 md:pt-14 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center justify-center gap-8 md:gap-12 px-6 md:px-10 min-w-max mx-auto">
                {SPONSORS.map((s, i) => (
                  <span
                    key={i}
                    className="flex-shrink-0 text-[16px] md:text-[20px] tracking-wide"
                    style={{
                      color: ACID,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 900,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Links — centred pair */}
            <div className="pt-12 md:pt-16 flex justify-center">
              <div className="grid grid-cols-2 gap-14 md:gap-20 text-center">
                <div>
                  <div
                    className="text-[11px] md:text-[12px] mb-4 tracking-[0.22em]"
                    style={{
                      color: MUTED_CREAM,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    PAGES
                  </div>
                  <div className="space-y-2">
                    {PAGES.map((p, i) => (
                      <div
                        key={i}
                        className="text-[22px] md:text-[26px] leading-none"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 900,
                        }}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[11px] md:text-[12px] mb-4 tracking-[0.22em]"
                    style={{
                      color: MUTED_CREAM,
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    FOLLOW ON
                  </div>
                  <div className="space-y-2">
                    {SOCIAL.map((s, i) => (
                      <div
                        key={i}
                        className="text-[22px] md:text-[26px] leading-none"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 900,
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. STORE */}
            <div className="pt-6 text-center">
              <span
                className="text-[16px] md:text-[20px] tracking-wider"
                style={{
                  color: ACID,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                }}
              >
                STORE
              </span>
            </div>

            {/* 4-6. Signature + tagline + portrait */}
            <div className="relative pt-14 md:pt-20">
              <div className="relative z-20 text-center pb-1">
                <span
                  className="inline-block text-[46px] md:text-[68px] leading-none"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontWeight: 900,
                    color: ACID,
                    transform: "rotate(-6deg)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Lando
                </span>
              </div>

              <div className="relative">
                <div
                  className="relative z-10 text-center text-[64px] md:text-[110px] leading-[0.92] tracking-tight"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
                >
                  ALWAYS
                </div>
                <div
                  className="relative z-10 text-center text-[64px] md:text-[110px] leading-[0.92]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}
                >
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontStyle: "italic",
                      fontWeight: 900,
                      color: MUTED_OLIVE,
                    }}
                  >
                    BRIN
                  </span>
                  <span className="ml-[0.6em]" style={{ color: CREAM }}>
                    THE
                  </span>
                </div>

                <img
                  src={PHOTO}
                  alt=""
                  draggable="false"
                  className="absolute pointer-events-none select-none z-20"
                  style={{
                    left: "50%",
                    transform: "translateX(-50%)",
                    bottom: "-10%",
                    height: "52vh",
                    width: "auto",
                    maxWidth: "none",
                  }}
                />
              </div>
            </div>

            {/* 7. Business enquiries CTA */}
            <div className="pt-24 md:pt-32 pb-10 flex justify-center relative z-30">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-[13px] tracking-widest"
                style={{
                  background: ACID,
                  color: OLIVE,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 900,
                }}
              >
                BUSINESS ENQUIRIES
                <HookArrow className="w-4 h-4" />
              </button>
            </div>

            {/* 8. Copyright bar */}
            <div
              className="px-6 md:px-10 pb-5 pt-3 flex items-center justify-between text-[10px] md:text-[11px] tracking-wider"
              style={{
                color: MUTED_CREAM,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
              }}
            >
              <div className="flex gap-3 md:gap-5">
                <span>PRIVACY POLICY</span>
                <span>TERMS</span>
              </div>
              <div>© 2026 Lando Norris. All rights reserved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Small lime tail below the card so the rounded bottom sits inside
          the band rather than flush against the page bottom. */}
      <div className="h-6 md:h-10" />
    </section>
  );
}