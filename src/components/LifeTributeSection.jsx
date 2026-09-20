// LifeTributeSection.jsx
//
// Life Tribute / Obituary section. Modelled on HelmetsSection: a full-
// width hero photo up top, a dark olive text panel underneath.
//
// The section is pulled up (via negative margin-top) so it OVERLAPS
// the preceding OnOffSection by exactly 50% of that section's half-
// portrait height — the LifeTribute hero photo covers the bottom half
// of those portraits, leaving their face-and-neck half visible above
// the cut.
//
// The overlap constant holds across viewports because the portraits'
// aspect ratio is CSS-locked to their natural 1728 × 2249:
//   • Mobile — portrait width is `170% × 50vw` = 85vw, so its height
//     is 85vw × (2249/1728) ≈ 110.6vw. Half of that ≈ 55vw → mt-[-55vw].
//   • Desktop — portrait width is fixed at 360px (md:w-[360px]), so
//     its height is 360 × 1.302 ≈ 469px. Half ≈ 234px → md:mt-[-234px].
//
// z-10 puts the section above the portraits' z-[5] stacking context.
//
// Text panel uses a 2-column CSS grid with the three body paragraphs
// placed in a staircase / editorial-zigzag pattern:
//
//   [ TITLE ]  [ COLUMN 1 ]      <- row 1
//   [ COL 2 ]  [    .     ]      <- row 2  (col 2 nudged left, under title)
//   [   .   ]  [ COLUMN 3 ]      <- row 3  (col 3 nudged right, under col 1)
//
// Section is `min-h-screen` so the tall obituary text can grow the
// mobile viewport past 100vh without cutting anything off; on desktop
// the same content sits comfortably inside a single screen.
//
// No scroll animation — it enters via natural page flow, same as
// HelmetsSection, so it "scrolls up" from below as the user continues
// past the Program of Service section.

const OLIVE = "#25281A";
const CREAM = "#EFEBDE";
const PHOTO = "/gallery/tribute.webp";

export default function LifeTributeSection() {
  return (
    <section
      className="relative w-full overflow-hidden min-h-screen z-10 mt-[-55vw] md:mt-[-234px]"
      style={{ background: OLIVE }}
    >
      {/* ============ TOP — Hero photo ============ */}
      {/* object-top keeps her face in the frame when the display aspect
          is wider than the source (source is 1200×1480, ~0.81 ratio). */}
      <div className="relative w-full h-[55vh] md:h-[60vh]">
        <img
          src={PHOTO}
          alt=""
          draggable="false"
          className="w-full h-full object-cover object-top select-none pointer-events-none"
        />
      </div>

      {/* ============ BOTTOM — Olive panel with staircase text ============ */}
      <div
        className="relative w-full px-5 md:px-10 py-8 md:py-12"
        style={{ color: CREAM }}
      >
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:gap-x-10 md:gap-y-10">
          {/* Row 1 · Col 1 — Title stack (LIFE TRIBUTE / Obituary) */}
          <div className="row-start-1 col-start-1 flex flex-col justify-start">
            <div
              className="text-[18px] md:text-[32px] leading-[0.95] tracking-tight"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 900,
                color: CREAM,
              }}
            >
              LIFE TRIBUTE
            </div>
            <div
              className="text-[16px] md:text-[28px] leading-[1.02] mt-1"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontStyle: "italic",
                color: "#CCFF33",
              }}
            >
              Obituary
            </div>
          </div>

          {/* Row 1 · Col 2 — Column 1 body */}
          <p
            className="row-start-1 col-start-2 text-[12px] md:text-[14px] leading-[1.45]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Madam Mary Onu Ogwo passed away peacefully on July 6, 2026, at the
            age of 62. She will be remembered for her warm smile, love,
            kindness, and industrious spirit.
          </p>

          {/* Row 2 · Col 1 — Column 2 body (nudged left, under the title) */}
          <p
            className="row-start-2 col-start-1 text-[12px] md:text-[14px] leading-[1.45]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Mary dedicated her life to serving Jehovah and sharing her faith
            with others. She symbolized her dedication to Jehovah God on
            February 25, 1978, and remained a faithful member of the South Post
            Oak Congregation of Jehovah&apos;s Witnesses until her passing. She
            was selfless both in her service to Jehovah and in her relationships
            with others.
          </p>

          {/* Row 3 · Col 2 — Column 3 body (nudged right, under column 1) */}
          <p
            className="row-start-3 col-start-2 text-[12px] md:text-[14px] leading-[1.45]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            Mary deeply loved her family and took great joy in discussing the
            Bible&apos;s promise of a peaceful paradise Earth. She is survived
            by her loving spouse, Onu O. Onu; her 7 children; 3 grandchildren;
            10 siblings; a host of other relatives; and a large spiritual family
            of brothers and sisters worldwide who look forward to welcoming her
            back in the resurrection.
          </p>
        </div>
      </div>
    </section>
  );
}
