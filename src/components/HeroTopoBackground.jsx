import { useEffect, useRef } from "react";

/**
 * HeroTopoBackground
 * ------------------
 * The hero's living topographic surface.
 *
 *   BASE — white fill, a small number of widely-spaced warm-grey contour
 *   lines traced (via marching squares) from a slowly drifting scalar
 *   field of gaussian blobs. Every active ripple contributes a moving
 *   sine-wave-under-gaussian-envelope to the same field, so the contour
 *   LINES themselves bulge and wave outward from where you tap/hover —
 *   the ripple isn't a ring drawn on top, it is the surface deforming.
 *
 *   BLURBS — soft-edged organic blobs in cream and light-grey, drifting
 *   over the contours. Each blurb spawns with its own random silhouette
 *   (7-10 angle- and radius-jittered points closed with smooth midpoint-
 *   quadratic curves) and gets a per-instance gaussian blur for feathered
 *   edges. Two spawn sources per the spec: ambient at roughly one per
 *   second at random positions across the whole surface, and along the
 *   cursor trail as it moves (throttled). Fade in, drift, fade out.
 *
 * Everything is drawn onto a single canvas — the blurbs' blur only
 * affects their own draw operations, so the contours stay crisp beneath.
 * The whole thing pauses cleanly when `active === false`.
 */
export default function HeroTopoBackground({ active = true }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Live state kept in refs so RAF sees the latest values without re-rendering
  const ripplesRef = useRef([]); // [{ x, y, born }]
  const blurbsRef = useRef([]); // [{ x, y, vx, vy, r, points, color, blur, peakAlpha, born, life }]
  const lastAmbientBlurbRef = useRef(0);
  const lastCursorBlurbRef = useRef(0);
  const lastRippleRef = useRef({ time: 0, x: -1000, y: -1000 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");

    // ---- Tunables --------------------------------------------------------
    const BG = "#FFFFFF";
    // Base contour lines — very subtle warm grey on white, few and airy
    const BASE_LINE = "rgba(150, 143, 130, 0.32)";
    const BASE_STROKE = 1.2;
    const BASE_CELL = 12;
    const BASE_LEVELS = 5;
    const BASE_LEVEL_START = 0.3;
    const BASE_LEVEL_STEP = 0.32;
    const BASE_BLOB_COUNT = 10;

    // Ripple physics — one wavefront per active ripple
    const RIPPLE_LIFE_MS = 1700;
    const RIPPLE_SPEED = 340; // px/s the wavefront expands
    const RIPPLE_WIDTH = 55; // gaussian sigma of the moving envelope (px)
    const RIPPLE_WAVE_K = 0.075; // spatial angular freq (rad/px) → λ ≈ 84px
    const RIPPLE_AMP = 1.1; // field strength added at wave crest
    const RIPPLE_CUTOFF = RIPPLE_WIDTH * 3;

    // Blurb behaviour — filled organic blobs of colour
    const BLURB_LIFE_MS = 1500;
    const BLURB_MIN_R = 75;
    const BLURB_MAX_R = 210;
    const AMBIENT_INTERVAL_MS = 950; // ~1 per second, per the spec
    const CURSOR_INTERVAL_MS = 220; // trail spacing along cursor
    const MAX_BLURBS = 20; // safety cap

    // Palette — creams and light-warm-greys sampled per blurb
    const BLURB_PALETTE = [
      "234, 227, 213", // warm cream
      "224, 217, 202", // deeper cream
      "220, 217, 210", // pale warm grey
      "210, 207, 200", // slightly cooler warm grey
    ];

    // Ripple throttling on the input side (matches HeroShrink's old feel)
    const RIPPLE_MIN_INTERVAL_MS = 75;
    const RIPPLE_MIN_DIST_PX = 22;

    // ---- Blob configuration (stable across the component lifetime) ------
    // Two negative blobs → basins/valleys, richer topography.
    const blobs = Array.from({ length: BASE_BLOB_COUNT }, (_, i) => {
      const negative = i >= BASE_BLOB_COUNT - 2;
      return {
        baseX: 0.06 + Math.random() * 0.88,
        baseY: 0.06 + Math.random() * 0.88,
        rangeX: 0.06 + Math.random() * 0.14,
        rangeY: 0.06 + Math.random() * 0.14,
        speedX: 0.06 + Math.random() * 0.14,
        speedY: 0.06 + Math.random() * 0.14,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        radius: 0.14 + Math.random() * 0.24,
        strength: negative ? -0.55 : 0.6 + Math.random() * 0.55,
      };
    });

    // ---- Organic-blob shape generator -----------------------------------
    // Points stored as offsets from the blob's centre so the whole shape
    // drifts as a unit. Angle jitter keeps them from feeling like regular
    // polygons; radius jitter is the primary source of "organic-ness".
    const makeBlobShape = (baseR) => {
      const n = 7 + Math.floor(Math.random() * 4); // 7-10 points
      const step = (Math.PI * 2) / n;
      const pts = new Array(n);
      for (let i = 0; i < n; i++) {
        const angle = i * step + (Math.random() - 0.5) * step * 0.55;
        const radius = baseR * (0.55 + Math.random() * 0.85); // 0.55-1.40
        pts[i] = { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
      }
      return pts;
    };

    const spawnBlurb = (x, y, now) => {
      const size = BLURB_MIN_R + Math.random() * (BLURB_MAX_R - BLURB_MIN_R);
      const color =
        BLURB_PALETTE[Math.floor(Math.random() * BLURB_PALETTE.length)];
      return {
        x,
        y,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.5) * 14,
        r: size,
        points: makeBlobShape(size),
        color,
        blur: 14 + Math.random() * 12, // 14-26px feathered edge
        peakAlpha: 0.48 + Math.random() * 0.28, // 0.48-0.76 at hold
        born: now,
        life: BLURB_LIFE_MS * (0.85 + Math.random() * 0.45),
      };
    };

    // ---- Sizing / grid buffers ------------------------------------------
    let dpr = window.devicePixelRatio || 1;
    let W = 0,
      H = 0;

    let gw = 0,
      gh = 0;
    let field = new Float32Array(0);
    let codes = new Int8Array(0);
    let visited = new Uint8Array(0);
    const blobCache = blobs.map(() => ({ x: 0, y: 0, r2: 0, s: 0 }));

    const setSize = () => {
      dpr = window.devicePixelRatio || 1;
      W = container.clientWidth;
      H = container.clientHeight;
      // Guard against 0×0 during initial layout
      if (W === 0 || H === 0) return;

      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);

      gw = Math.ceil(W / BASE_CELL) + 2;
      gh = Math.ceil(H / BASE_CELL) + 2;
      field = new Float32Array(gw * gh);
      codes = new Int8Array((gw - 1) * (gh - 1));
      visited = new Uint8Array((gw - 1) * (gh - 1) * 2);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(container);

    // ---- Field sampling with ripple perturbation ------------------------
    // Sum-of-gaussian-blobs plus, for each active ripple, a moving
    // sine-under-gaussian wavefront. The wave is spatially bounded (cutoff)
    // so out-of-range ripples cost almost nothing.
    const sampleField = (now) => {
      const ripples = ripplesRef.current;
      const nR = ripples.length;

      // Pre-compute per-ripple derived quantities to keep the inner loop tight
      const rData = new Array(nR);
      for (let i = 0; i < nR; i++) {
        const r = ripples[i];
        const ageMs = now - r.born;
        const t01 = ageMs / RIPPLE_LIFE_MS;
        const radius = (ageMs / 1000) * RIPPLE_SPEED;
        // Ease-out life decay so the wave dies smoothly at end of life
        const decay = (1 - t01) * (1 - t01);
        rData[i] = { x: r.x, y: r.y, radius, decay };
      }

      for (let iy = 0; iy < gh; iy++) {
        const y = iy * BASE_CELL;
        const rowBase = iy * gw;
        for (let ix = 0; ix < gw; ix++) {
          const x = ix * BASE_CELL;
          let sum = 0;

          // Blob contributions
          for (let i = 0; i < blobCache.length; i++) {
            const c = blobCache[i];
            const ddx = x - c.x,
              ddy = y - c.y;
            sum += c.s * Math.exp(-(ddx * ddx + ddy * ddy) / c.r2);
          }

          // Ripple contributions (skipped when far from the wavefront)
          for (let i = 0; i < nR; i++) {
            const rd = rData[i];
            const dx = x - rd.x;
            const dy = y - rd.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const delta = d - rd.radius;
            if (delta < -RIPPLE_CUTOFF || delta > RIPPLE_CUTOFF) continue;
            const envelope = Math.exp(
              -(delta * delta) / (RIPPLE_WIDTH * RIPPLE_WIDTH),
            );
            const wave = Math.sin(delta * RIPPLE_WAVE_K);
            sum += RIPPLE_AMP * wave * envelope * rd.decay;
          }

          field[rowBase + ix] = sum;
        }
      }
    };

    // ---- Blurb drawing --------------------------------------------------
    // Draws a filled organic silhouette with a soft feathered edge. Uses
    // ctx.filter for the blur, wrapped in save/restore so it doesn't leak
    // into subsequent draws. Blur radius is scaled by dpr so retina and
    // 1x screens read the same visually.
    const drawBlurb = (b, now) => {
      const t01 = (now - b.born) / b.life;
      let alphaMult;
      if (t01 < 0.25) alphaMult = t01 / 0.25;
      else if (t01 > 0.7) alphaMult = Math.max(0, (1 - t01) / 0.3);
      else alphaMult = 1;
      if (alphaMult <= 0) return;

      ctx.save();
      ctx.filter = `blur(${b.blur * dpr}px)`;
      ctx.globalAlpha = b.peakAlpha * alphaMult;
      ctx.fillStyle = `rgb(${b.color})`;

      // Smooth closed curve via the midpoint-quadratic method: each edge
      // connects the midpoint of two neighbouring vertices, passing through
      // the vertex itself as a quadratic control point. This produces a
      // C1-continuous closed shape with no cusps or pinch points, even
      // when the underlying vertices are wildly perturbed.
      const pts = b.points;
      const n = pts.length;
      const last = pts[n - 1];
      const first = pts[0];
      ctx.beginPath();
      ctx.moveTo(
        b.x + (last.dx + first.dx) / 2,
        b.y + (last.dy + first.dy) / 2,
      );
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        const nxt = pts[(i + 1) % n];
        ctx.quadraticCurveTo(
          b.x + p.dx,
          b.y + p.dy,
          b.x + (p.dx + nxt.dx) / 2,
          b.y + (p.dy + nxt.dy) / 2,
        );
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    // ---- One RAF loop drives everything ---------------------------------
    let rafId = 0;
    const start = performance.now();

    const step = () => {
      const now = performance.now();
      const t = (now - start) / 1000;

      // 1. Cull expired ripples & blurbs
      ripplesRef.current = ripplesRef.current.filter(
        (r) => now - r.born < RIPPLE_LIFE_MS,
      );
      blurbsRef.current = blurbsRef.current.filter(
        (b) => now - b.born < b.life,
      );

      // 2. Spawn an ambient blurb roughly once per second, anywhere on the
      // surface (fully random per the spec — no vertical bias).
      if (
        now - lastAmbientBlurbRef.current > AMBIENT_INTERVAL_MS &&
        blurbsRef.current.length < MAX_BLURBS &&
        W > 0 &&
        H > 0
      ) {
        lastAmbientBlurbRef.current = now;
        blurbsRef.current.push(
          spawnBlurb(Math.random() * W, Math.random() * H, now),
        );
      }

      // 3. Drift blurb positions (~60fps assumed; good enough for soft drift)
      const dt = 1 / 60;
      for (const b of blurbsRef.current) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }

      if (W === 0 || H === 0) {
        rafId = requestAnimationFrame(step);
        return;
      }

      // 4. Update blob cache (uses live t for drift)
      const rMul = Math.min(W, H);
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i],
          c = blobCache[i];
        c.x = (b.baseX + Math.sin(t * b.speedX + b.phaseX) * b.rangeX) * W;
        c.y = (b.baseY + Math.cos(t * b.speedY + b.phaseY) * b.rangeY) * H;
        const r = b.radius * rMul;
        c.r2 = r * r;
        c.s = b.strength;
      }

      // 5. Sample scalar field (with ripple perturbation)
      sampleField(now);

      // 6. Draw — white fill, then contours, then blurbs on top.
      // The blurbs' blur only affects their own draw operations, so the
      // contours stay crisp beneath even where blurbs overlap them.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = BASE_LINE;
      ctx.lineWidth = BASE_STROKE;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let lv = 0; lv < BASE_LEVELS; lv++) {
        const thr = BASE_LEVEL_START + lv * BASE_LEVEL_STEP;
        traceLevel(ctx, field, codes, visited, gw, gh, BASE_CELL, thr);
      }

      for (const b of blurbsRef.current) drawBlurb(b, now);

      if (active) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    // ---- Input handling -------------------------------------------------
    // We listen on window (same pattern the site uses elsewhere) and
    // convert to container-local coords. The parent may also be listening
    // for its own reasons (e.g. portrait tilt) — that's fine, both can
    // coexist.
    const handlePoint = (clientX, clientY, force) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      // Ignore points that aren't over our surface
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const now = performance.now();

      // Ripple: throttled by distance/time so scrubbing the cursor doesn't
      // spam the field. Taps always spawn (force).
      const last = lastRippleRef.current;
      const dx = x - last.x,
        dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      if (
        force ||
        (now - last.time >= RIPPLE_MIN_INTERVAL_MS &&
          dist >= RIPPLE_MIN_DIST_PX)
      ) {
        ripplesRef.current.push({ x, y, born: now });
        lastRippleRef.current = { time: now, x, y };
      }

      // Cursor-trail blurb: also throttled, so a moving cursor drops one
      // blurb every CURSOR_INTERVAL_MS. Combined with ambient, this gives
      // "both" (per the user's spec).
      if (
        now - lastCursorBlurbRef.current > CURSOR_INTERVAL_MS &&
        blurbsRef.current.length < MAX_BLURBS
      ) {
        lastCursorBlurbRef.current = now;
        blurbsRef.current.push(spawnBlurb(x, y, now));
      }
    };

    const onMouseMove = (e) => handlePoint(e.clientX, e.clientY, false);
    const onTouchStart = (e) => {
      const t = e.touches[0];
      if (t) handlePoint(t.clientX, t.clientY, true);
    };
    const onTouchMove = (e) => {
      const t = e.touches[0];
      if (t) handlePoint(t.clientX, t.clientY, false);
    };

    if (active) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [active]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ background: "#FFFFFF" }}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ display: "block" }}
      />
    </div>
  );
}

// =========================================================================
// Marching-squares contour tracing
// Walks connected iso-lines as continuous sub-paths (with saddle-point
// disambiguation) so the pattern reads as flowing topography rather than
// per-cell chord fragments. Same algorithm as AnimatedTopo — kept local so
// this component stays self-contained and the shared version can be
// factored out later without risk to the other pages that use AnimatedTopo.
// =========================================================================
const NBR_DX = [0, 1, 0, -1];
const NBR_DY = [-1, 0, 1, 0];
const OPPOSITE = [2, 3, 0, 1];

const backBuf = [];
const fwdBuf = [];

function traceLevel(ctx, field, codes, visited, gw, gh, cs, thr) {
  const w = gw - 1,
    h = gh - 1;

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

        walk(ix, iy, ea, backBuf, codes, visited, field, gw, w, h, cs, thr);
        walk(ix, iy, eb, fwdBuf, codes, visited, field, gw, w, h, cs, thr);

        const eaX = edgeXOf(ix, iy, ea, field, gw, cs, thr);
        const eaY = edgeYOf(ix, iy, ea, field, gw, cs, thr);
        const ebX = edgeXOf(ix, iy, eb, field, gw, cs, thr);
        const ebY = edgeYOf(ix, iy, eb, field, gw, cs, thr);

        const backLen = backBuf.length;
        if (backLen > 0) {
          ctx.moveTo(backBuf[backLen - 2], backBuf[backLen - 1]);
          for (let k = backLen - 4; k >= 0; k -= 2) {
            ctx.lineTo(backBuf[k], backBuf[k + 1]);
          }
          ctx.lineTo(eaX, eaY);
        } else {
          ctx.moveTo(eaX, eaY);
        }
        ctx.lineTo(ebX, ebY);
        for (let k = 0; k < fwdBuf.length; k += 2) {
          ctx.lineTo(fwdBuf[k], fwdBuf[k + 1]);
        }
      }
    }
  }

  ctx.stroke();
}

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
