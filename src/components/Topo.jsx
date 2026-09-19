export default function Topo({ opacity = 0.35 }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <g fill="none" stroke="#a29b83" strokeWidth="0.8" style={{ opacity }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <path
            key={`t-${i}`}
            d={`M ${-150 + i * 30} ${80 + i * 26}
                C ${240 + i * 18} ${30 + i * 8}, ${520} ${260 + i * 6}, ${820 - i * 12} ${180 + i * 22}
                S ${1200 + i * 4} ${430 - i * 3}, ${1700} ${360 + i * 18}`}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <path
            key={`b-${i}`}
            d={`M ${-80 + i * 26} ${540 + i * 20}
                C ${220} ${480 + i * 10}, ${580} ${700 - i * 5}, ${900 + i * 6} ${600 + i * 12}
                S ${1300} ${780 - i * 8}, ${1700} ${700 + i * 4}`}
          />
        ))}
      </g>
    </svg>
  );
}
