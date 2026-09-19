export default function NextRaceCard({ race = "BAKU GP" }) {
  return (
    <div
      className="fixed bottom-4 left-4 z-40 w-[150px]"
      style={{
        clipPath:
          "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
        border: "1px solid rgba(0,0,0,0.18)",
      }}
    >
      <div className="p-3">
        <div className="text-[10px] tracking-[0.25em] text-black/70 font-semibold font-sans">
          NEXT RACE
        </div>
        <div className="my-3 flex justify-center">
          <svg viewBox="0 0 40 40" className="w-8 h-8" aria-hidden>
            <path
              d="M 12 6 L 28 6 L 28 14 C 28 20, 24 24, 20 24 C 16 24, 12 20, 12 14 Z
                 M 12 8 L 6 8 L 6 12 C 6 15, 8 17, 12 17
                 M 28 8 L 34 8 L 34 12 C 34 15, 32 17, 28 17
                 M 18 24 L 22 24 L 22 30 L 26 30 L 26 34 L 14 34 L 14 30 L 18 30 Z"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-[13px] font-black tracking-wider text-black text-center font-sans">
          {race}
        </div>
        <div className="mt-3 pt-3 border-t border-black/15 flex flex-col items-center gap-1">
          <svg viewBox="0 0 60 30" className="w-14 h-7" aria-hidden>
            <g
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="0.9"
              strokeLinecap="round"
            >
              <path d="M 8 22 C 4 18, 4 12, 10 8" />
              <path d="M 10 22 C 8 18, 8 14, 12 10" />
              <path d="M 12 22 C 12 18, 12 14, 14 12" />
              <path d="M 52 22 C 56 18, 56 12, 50 8" />
              <path d="M 50 22 C 52 18, 52 14, 48 10" />
              <path d="M 48 22 C 48 18, 48 14, 46 12" />
            </g>
            <g transform="translate(22, 8)">
              <path
                d="M 8 2 C 12 2, 15 5, 15 10 L 15 13 L 13 14 L 13 15 L 3 15 L 3 14 L 1 13 L 1 10 C 1 5, 4 2, 8 2 Z"
                fill="none"
                stroke="#0a0a0a"
                strokeWidth="0.9"
              />
              <path d="M 4 8 L 12 8 L 12 11 L 4 11 Z" fill="#0a0a0a" />
            </g>
          </svg>
          <div className="text-[8px] tracking-[0.15em] text-black/80 text-center leading-tight font-bold font-sans">
            MCLAREN F1
            <br />
            SINCE 2019
          </div>
        </div>
      </div>
    </div>
  );
}
