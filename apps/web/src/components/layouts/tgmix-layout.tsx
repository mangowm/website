"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CARD_ACTIVE, CARD_BASE, CARD_INACTIVE, CARD_TRANSITION } from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TgmixLayoutProps {}

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP = 16;
const SINGLE_PAD_H = 0.1;
const SINGLE_PAD_V = 0.15;

// Timings are slightly longer to accommodate 4 windows
const TIMINGS = [
  { phase: 0, delay: 0 },
  { phase: 1, delay: 500 },
  { phase: 2, delay: 1500 },
  { phase: 3, delay: 2500 },
  { phase: 4, delay: 3500 },
  { phase: 5, delay: 4500 },
  { phase: 6, delay: 5500 },
  { phase: 7, delay: 6500 },
  { phase: 8, delay: 7500 },
  { phase: 9, delay: 8500 },
  { phase: 10, delay: 9500 },
] as const;

const TOTAL_DURATION = 10500;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TgmixLayout — hybrid tile/grid layout.
 * ≤3 windows → classic master/stack tile.
 * 4  windows → equal-cell grid.
 *
 * Phase guide:
 *  0   – init
 *  1   – 1 window
 *  2   – 2 windows (tile)
 *  3   – 3 windows (tile)
 *  4   – 4 windows (grid)
 *  5   – swap: window 1 ↔ window 4 in the grid
 *  6   – return swap
 *  7   – 3 windows (window 4 gone, back to tile)
 *  8   – 2 windows
 *  9   – 1 window
 *  10  – hidden
 */
export function TgmixLayout({}: TgmixLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const r4 = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState(0);
  const [loopKey, setLoopKey] = useState(0);

  // Apply CSS transition once on mount
  useEffect(() => {
    for (const ref of [r1, r2, r3, r4]) {
      if (ref.current) ref.current.style.transition = CARD_TRANSITION;
    }
  }, []);

  // Position cards whenever phase changes
  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      if (!container) return;

      const { clientWidth: width, clientHeight: height } = container;


      const halfW = (width - GAP) / 2;
      const halfH = (height - GAP) / 2;
      const rightX = halfW + GAP;
      const bottomY = halfH + GAP;

      // ── Derived state ──────────────────────────────────────────────────

      const activeWindows =
        phase <= 0
          ? 0
          : phase === 1
            ? 1
            : phase === 2
              ? 2
              : phase === 3
                ? 3
                : phase <= 6
                  ? 4
                  : phase === 7
                    ? 3
                    : phase === 8
                      ? 2
                      : phase === 9
                        ? 1
                        : 0;

      const isSwap = phase === 5;

      const focusedWindow =
        phase <= 1
          ? 1
          : phase === 2
            ? 2
            : phase === 3
              ? 3
              : phase <= 6
                ? 4
                : phase === 7
                  ? 3
                  : phase === 8
                    ? 2
                    : 1;

      const useTile = activeWindows <= 3;

      // ── Tile layout (≤3 windows) ───────────────────────────────────────

      if (useTile) {
        let pos0: Rect, pos1: Rect, pos2: Rect;

        if (activeWindows <= 1) {
          pos0 = { x: 0, y: 0, w: width, h: height };
          pos1 = { x: rightX, y: 0, w: halfW, h: height };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        } else if (activeWindows === 2) {
          pos0 = { x: 0, y: 0, w: halfW, h: height };
          pos1 = { x: rightX, y: 0, w: halfW, h: height };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        } else {
          pos0 = { x: 0, y: 0, w: halfW, h: height };
          pos1 = { x: rightX, y: 0, w: halfW, h: halfH };
          pos2 = { x: rightX, y: bottomY, w: halfW, h: halfH };
        }

        setCard(r1.current, pos0, phase > 0 && phase < 10, focusedWindow === 1);
        setCard(r2.current, pos1, phase >= 2 && phase < 9, focusedWindow === 2);
        setCard(r3.current, pos2, phase >= 3 && phase < 8, focusedWindow === 3);

        // Window 4 is off-screen while in tile mode
        setCard(r4.current, { x: width, y: height, w: halfW, h: halfH }, false, false);

        // ── Grid layout (4 windows) ────────────────────────────────────────
      } else {
        const gridPos = buildGrid(4, width, height, "horizontal");

        const w1Pos = isSwap ? gridPos[3] : gridPos[0];
        const w4Pos = isSwap ? gridPos[0] : gridPos[3];

        setCard(r1.current, w1Pos, phase >= 4 && phase < 7, focusedWindow === 1);
        setCard(r2.current, gridPos[1], phase >= 2 && phase < 9, focusedWindow === 2);
        setCard(r3.current, gridPos[2], phase >= 3 && phase < 8, focusedWindow === 3);
        setCard(r4.current, w4Pos, phase >= 4 && phase < 7, focusedWindow === 4);
      }
    };

    update();

    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [phase]);

  // Animation loop
  useEffect(() => {
    const timeouts = TIMINGS.map(({ phase: p, delay }) => setTimeout(() => setPhase(p), delay));
    const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(loop);
    };
  }, [loopKey]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden p-4">
      <div ref={r1} className="absolute opacity-0">
        1
      </div>
      <div ref={r2} className="absolute opacity-0">
        2
      </div>
      <div ref={r3} className="absolute opacity-0">
        3
      </div>
      <div ref={r4} className="absolute opacity-0">
        4
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setCard(
  el: HTMLDivElement | null,
  { x, y, w, h }: Rect,
  visible: boolean,
  active: boolean,
) {
  if (!el) return;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.opacity = visible ? "1" : "0";
  el.style.transform = visible ? "scale(1)" : "scale(0.9)";
  el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
}

/**
 * Equal-cell grid for n windows, respecting orientation preference.
 * Extracted so it can be used by both the 4-window grid branch and any
 * future callers.
 */
function buildGrid(
  n: number,
  width: number,
  height: number,
  orientation: "horizontal" | "vertical",
): Rect[] {
  if (n === 0) return [];

  if (n === 1) {
    const w = width * (1 - SINGLE_PAD_H * 2);
    const h = height * (1 - SINGLE_PAD_V * 2);
    return [{ x: (width - w) / 2, y: (height - h) / 2, w, h }];
  }

  if (n === 2) {
    if (orientation === "horizontal") {
      const rowH = height * (1 - SINGLE_PAD_V * 2);
      const startY = (height - rowH) / 2;
      const w = (width - GAP) / 2;
      return [
        { x: 0, y: startY, w, h: rowH },
        { x: w + GAP, y: startY, w, h: rowH },
      ];
    } else {
      const colW = width * (1 - SINGLE_PAD_H * 2);
      const startX = (width - colW) / 2;
      const h = (height - GAP) / 2;
      return [
        { x: startX, y: 0, w: colW, h },
        { x: startX, y: h + GAP, w: colW, h },
      ];
    }
  }

  const cols =
    orientation === "horizontal" ? Math.ceil(Math.sqrt(n)) : Math.ceil(n / Math.ceil(Math.sqrt(n)));
  const rows = Math.ceil(n / cols);

  const cellW = (width - (cols - 1) * GAP) / cols;
  const cellH = (height - (rows - 1) * GAP) / rows;

  if (orientation === "horizontal") {
    const gridH = rows * cellH + (rows - 1) * GAP;
    const startY = (height - gridH) / 2;

    return Array.from({ length: n }, (_, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const itemsInRow = row === rows - 1 ? n - row * cols : cols;
      const rowW = itemsInRow * cellW + (itemsInRow - 1) * GAP;
      const rowStartX = (width - rowW) / 2;
      return {
        x: rowStartX + col * (cellW + GAP),
        y: startY + row * (cellH + GAP),
        w: cellW,
        h: cellH,
      };
    });
  } else {
    const gridW = cols * cellW + (cols - 1) * GAP;
    const startX = (width - gridW) / 2;

    return Array.from({ length: n }, (_, i) => {
      const col = Math.floor(i / rows);
      const row = i % rows;
      const itemsInCol = col === cols - 1 ? n - col * rows : rows;
      const colH = itemsInCol * cellH + (itemsInCol - 1) * GAP;
      const colStartY = (height - colH) / 2;
      return {
        x: startX + col * (cellW + GAP),
        y: colStartY + row * (cellH + GAP),
        w: cellW,
        h: cellH,
      };
    });
  }
}
