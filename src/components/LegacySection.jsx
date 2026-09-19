// Two typographic styles interleaved in the writeup: italic serif in acid
// green for the emphasised words, bold sans in cream for the rest — matches
// the LANDO NORRIS wordmark treatment used elsewhere in the site.
const acidStyle = {
  fontFamily: "'Playfair Display', serif",
  fontWeight: 900,
  fontStyle: "italic",
};
const creamStyle = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 900,
};

function Acid({ children }) {
  return (
    <span className="text-acid" style={acidStyle}>
      {children}
    </span>
  );
}

function Cream({ children }) {
  return (
    <span className="text-cream" style={creamStyle}>
      {children}
    </span>
  );
}

export default function LegacySection() {
  return (
    <section
      className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6 py-16 md:py-32"
      style={{ background: "#25281A", color: "#EFEBDE" }}
    >
      {/* Big mixed-typography writeup — forced 2/2/3/4/3/4/3/1 line breaks
          on mobile; desktop is wide enough to wrap naturally. */}
      <div
        className="relative max-w-4xl text-center leading-[1.05] tracking-tight text-[24px] md:text-[68px]"
      >
        <Acid>REDEFINING</Acid> <Cream>LIMITS,</Cream>
        <br className="md:hidden" />{" "}
        <Cream>FIGHTING FOR</Cream>
        <br className="md:hidden" />{" "}
        <Acid>WINS</Acid><Cream>, BRINGING IT</Cream>
        <br className="md:hidden" />{" "}
        <Cream>ALL IN ALL WAYS.</Cream>
        <br className="md:hidden" />{" "}
        <Cream>DEFINING A</Cream> <Acid>LEGACY</Acid>
        <br className="md:hidden" />{" "}
        <Cream>IN FORMULA 1 ON</Cream>
        <br className="md:hidden" />{" "}
        <Cream>AND OFF THE</Cream>
        <br className="md:hidden" />{" "}
        <Cream>TRACK.</Cream>
      </div>
    </section>
  );
}
