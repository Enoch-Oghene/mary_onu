import { useEffect, useRef } from "react";

/**
 * Animated topographic background.
 *
 * We define a smooth 2-D scalar field (a sum of drifting gaussian blobs)
 * and re-trace its iso-contours every frame. Each contour is walked from
 * cell to cell using marching-squares with saddle disambiguation, so the
 * line renders as one continuous path — no visible cell-boundary seams and
 * no saddle-point crosshairs. Contours flow smoothly into each other and
 * close on themselves the way real topographic lines do.
 */
export default function AnimatedTopo({
  bg = "#25281A",
  lineColor = "rgba(188, 200, 160, 0.6)",
  numBlobs = 10,
  cellSize = 10,
  numLevels = 9,
  levelStep = 0.18,
  levelStart = 0.28,
  strokeWidth = 1.2,
  // When null/"transparent" the canvas is cleared (not filled) each frame,
  // so the topo can overlay whatever background sits beneath it. Combined
  // with mixBlendMode this lets a single topo instance flow across bg
  // colours that change with scroll.
  mixBlendMode = "normal",
  // When false, draw one frame at t=0 and stop — the pattern is frozen
  // instead of animated. Redraws once on resize.
  animate = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Blob configuration — random-but-stable across the component lifetime.
    // Mixing sizes and a few "negative" (valley) blobs gives more varied
    // topography (ridges, basins, saddles) than uniform-strength blobs would.
    const blobs = Array.from({ length: numBlobs }, (_, i) => {
      const negative = i >= numBlobs - 2;
      return {
        baseX: 0.08 + Math.random() * 0.84,
        baseY: 0.08 + Math.random() * 0.84,
        rangeX: 0.06 + Math.random() * 0.14,
        rangeY: 0.06 + Math.random() * 0.14,
        speedX: 0.06 + Math.random() * 0.14,
        speedY: 0.06 + Math.random() * 0.14,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        radius: 0.12 + Math.random() * 0.22,
        strength: negative ? -0.55 : 0.6 + Math.random() * 0.55,
      };
    });

    let dpr = window.devicePixelRatio || 1;
    let W = 0,
      H = 0;
    let gw = 0,
      gh = 0;
    let field = new Float32Array(0);
    let codes = new Int8Array(0);
    let visited = new Uint8Array(0);
    const bCache = blobs.map(() => ({ x: 0, y: 0, r2: 0, s: 0 }));

    const setSize = () => {
      dpr = window.devicePixelRatio || 1;
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      gw = Math.ceil(W / cellSize) + 2;
      gh = Math.ceil(H / cellSize) + 2;
      field = new Float32Array(gw * gh);
      codes = new Int8Array((gw - 1) * (gh - 1));
      // Two visited slots per cell — saddle cells have two independent pairs
      visited = new Uint8Array((gw - 1) * (gh - 1) * 2);
    };
    setSize();

    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);

    let rafId;
    const start = performance.now();

    const draw = () => {
      const t = (performance.now() - start) / 1000;

      // 1. Update blob positions in canvas space
      const rMul = Math.min(W, H);
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const c = bCache[i];
        c.x = (b.baseX + Math.sin(t * b.speedX + b.phaseX) * b.rangeX) * W;
        c.y = (b.baseY + Math.cos(t * b.speedY + b.phaseY) * b.rangeY) * H;
        const r = b.radius * rMul;
        c.r2 = r * r;
        c.s = b.strength;
      }

      // 2. Sample the field on the grid
      for (let iy = 0; iy < gh; iy++) {
        const y = iy * cellSize;
        const rowBase = iy * gw;
        for (let ix = 0; ix < gw; ix++) {
          const x = ix * cellSize;
          let sum = 0;
          for (let i = 0; i < bCache.length; i++) {
            const c = bCache[i];
            const ddx = x - c.x,
              ddy = y - c.y;
            sum += c.s * Math.exp(-(ddx * ddx + ddy * ddy) / c.r2);
          }
          field[rowBase + ix] = sum;
        }
      }

      // 3. Clear + draw
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (bg && bg !== "transparent") {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.clearRect(0, 0, W, H);
      }

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 4. Trace each iso-level as continuous contours
      for (let lv = 0; lv < numLevels; lv++) {
        const thr = levelStart + lv * levelStep;
        traceLevel(ctx, field, codes, visited, gw, gh, cellSize, thr);
      }

      if (animate) rafId = requestAnimationFrame(draw);
    };
    if (animate) {
      rafId = requestAnimationFrame(draw);
    } else {
      // Static mode: draw one frame now, and one more per resize.
      draw();
      const staticRedraw = () => draw();
      ro.disconnect();
      const ro2 = new ResizeObserver(() => {
        setSize();
        staticRedraw();
      });
      ro2.observe(canvas);
      return () => {
        cancelAnimationFrame(rafId);
        ro2.disconnect();
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [
    bg,
    lineColor,
    numBlobs,
    cellSize,
    numLevels,
    levelStep,
    levelStart,
    strokeWidth,
    mixBlendMode,
    animate,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ display: "block", mixBlendMode }}
    />
  );
}

// ---- Contour tracing --------------------------------------------------------
// Edge indices around each cell: 0=top, 1=right, 2=bottom, 3=left.
const NBR_DX = [0, 1, 0, -1];
const NBR_DY = [-1, 0, 1, 0];
const OPPOSITE = [2, 3, 0, 1];

// Scratch buffers reused across every trace to avoid per-frame allocations.
const backBuf = [];
const fwdBuf = [];

/**
 * Trace and stroke every iso-contour at threshold `thr`. Each contour is
 * walked across cell boundaries as one continuous sub-path, so the line
 * flows into itself rather than being drawn as isolated per-cell chords.
 */
function traceLevel(ctx, field, codes, visited, gw, gh, cs, thr) {
  const w = gw - 1,
    h = gh - 1;

  // 1. Compute per-cell marching-squares code
  for (let iy = 0; iy < h; iy++) {
    for (let ix = 0; ix < w; ix++) {
      const i = iy * gw + ix;
      const tl = field[i],
        tr = field[i + 1];
      const br = field[i + 1 + gw],
        bl = field[i + gw];
      codes[iy * w + ix] =
        (tl > thr ? 8 : 0) |
        (tr > thr ? 4 : 0) |
        (br > thr ? 2 : 0) |
        (bl > thr ? 1 : 0);
    }
  }
  visited.fill(0);

  ctx.beginPath();

  // 2. Seed a trace at every unvisited connection pair, walk both directions
  for (let iy = 0; iy < h; iy++) {
    for (let ix = 0; ix < w; ix++) {
      const code = codes[iy * w + ix];
      if (code === 0 || code === 15) continue;

      const pairs = pairsFor(code, ix, iy, field, gw, thr);
      const nP = pairs.length >> 1;

      for (let p = 0; p < nP; p++) {
        const vi = (iy * w + ix) * 2 + p;
        if (visited[vi]) continue;
        visited[vi] = 1;

        const ea = pairs[p * 2],
          eb = pairs[p * 2 + 1];

        // Walk from the seed cell in both directions
        walk(ix, iy, ea, backBuf, codes, visited, field, gw, w, h, cs, thr);
        walk(ix, iy, eb, fwdBuf, codes, visited, field, gw, w, h, cs, thr);

        const eaX = edgeXOf(ix, iy, ea, field, gw, cs, thr);
        const eaY = edgeYOf(ix, iy, ea, field, gw, cs, thr);
        const ebX = edgeXOf(ix, iy, eb, field, gw, cs, thr);
        const ebY = edgeYOf(ix, iy, eb, field, gw, cs, thr);

        // Emit as one sub-path: reversed backward, then seed's ea → eb, then forward
        const backLen = backBuf.length;
        if (backLen > 0) {
          ctx.moveTo(backBuf[backLen - 2], backBuf[backLen - 1]);
          for (let i = backLen - 4; i >= 0; i -= 2) {
            ctx.lineTo(backBuf[i], backBuf[i + 1]);
          }
          ctx.lineTo(eaX, eaY);
        } else {
          ctx.moveTo(eaX, eaY);
        }
        ctx.lineTo(ebX, ebY);
        for (let i = 0; i < fwdBuf.length; i += 2) {
          ctx.lineTo(fwdBuf[i], fwdBuf[i + 1]);
        }
      }
    }
  }

  ctx.stroke();
}

// Returns the flat list of connected-edge pairs for a cell code.
// Non-saddle codes have one pair (length 2). Saddle codes (5, 10) return
// two pairs (length 4), disambiguated by the field value at the cell centre
// so contours never cross themselves at saddle points.
// Arrays are module-level constants so this stays allocation-free on the hot path.
const P_1_14 = [3, 2];
const P_2_13 = [1, 2];
const P_3_12 = [3, 1];
const P_4_11 = [0, 1];
const P_6_9 = [0, 2];
const P_7_8 = [3, 0];
const P_SADDLE_A = [3, 0, 1, 2];
const P_SADDLE_B = [0, 1, 3, 2];

function pairsFor(code, ix, iy, field, gw, thr) {
  switch (code) {
    case 1:
    case 14:
      return P_1_14;
    case 2:
    case 13:
      return P_2_13;
    case 3:
    case 12:
      return P_3_12;
    case 4:
    case 11:
      return P_4_11;
    case 6:
    case 9:
      return P_6_9;
    case 7:
    case 8:
      return P_7_8;
  }
  const i = iy * gw + ix;
  const tl = field[i],
    tr = field[i + 1];
  const br = field[i + 1 + gw],
    bl = field[i + gw];
  const inside = (tl + tr + br + bl) * 0.25 > thr;
  if (code === 5) return inside ? P_SADDLE_A : P_SADDLE_B;
  /* code 10 */ return inside ? P_SADDLE_B : P_SADDLE_A;
}

// Sub-cell precise x/y of the contour crossing on `edge` of cell (ix, iy).
function edgeXOf(ix, iy, edge, field, gw, cs, thr) {
  const i = iy * gw + ix;
  const x0 = ix * cs;
  if (edge === 0) {
    const tl = field[i],
      tr = field[i + 1];
    return x0 + cs * ((thr - tl) / (tr - tl));
  }
  if (edge === 1) return x0 + cs;
  if (edge === 2) {
    const bl = field[i + gw],
      br = field[i + 1 + gw];
    return x0 + cs * ((thr - bl) / (br - bl));
  }
  return x0;
}
function edgeYOf(ix, iy, edge, field, gw, cs, thr) {
  const i = iy * gw + ix;
  const y0 = iy * cs;
  if (edge === 0) return y0;
  if (edge === 1) {
    const tr = field[i + 1],
      br = field[i + 1 + gw];
    return y0 + cs * ((thr - tr) / (br - tr));
  }
  if (edge === 2) return y0 + cs;
  const tl = field[i],
    bl = field[i + gw];
  return y0 + cs * ((thr - tl) / (bl - tl));
}

// Walk from cell (sx, sy) exiting through `initialExit`, collecting the
// exit point of every subsequent cell into `out` as [x, y] pairs. Stops on
// out-of-bounds, empty cells, no matching pair, or a visited pair (i.e. a
// closed loop returning to itself). `out.length` is reset at entry.
function walk(
  sx,
  sy,
  initialExit,
  out,
  codes,
  visited,
  field,
  gw,
  w,
  h,
  cs,
  thr,
) {
  out.length = 0;
  let cx = sx,
    cy = sy,
    exit = initialExit;

  while (true) {
    const nx = cx + NBR_DX[exit],
      ny = cy + NBR_DY[exit];
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) break;
    const ncode = codes[ny * w + nx];
    if (ncode === 0 || ncode === 15) break;

    const pairs = pairsFor(ncode, nx, ny, field, gw, thr);
    const enter = OPPOSITE[exit];

    let pIdx = -1,
      nextExit = -1;
    for (let k = 0; k < pairs.length; k += 2) {
      if (pairs[k] === enter) {
        pIdx = k >> 1;
        nextExit = pairs[k + 1];
        break;
      }
      if (pairs[k + 1] === enter) {
        pIdx = k >> 1;
        nextExit = pairs[k];
        break;
      }
    }
    if (pIdx === -1) break;

    const vi = (ny * w + nx) * 2 + pIdx;
    if (visited[vi]) break;
    visited[vi] = 1;

    out.push(
      edgeXOf(nx, ny, nextExit, field, gw, cs, thr),
      edgeYOf(nx, ny, nextExit, field, gw, cs, thr),
    );

    cx = nx;
    cy = ny;
    exit = nextExit;
  }
}
