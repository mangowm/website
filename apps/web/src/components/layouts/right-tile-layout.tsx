"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	CARD_ACTIVE,
	CARD_BASE,
	CARD_INACTIVE,
	CARD_TRANSITION,
	TIMINGS,
	TOTAL_DURATION,
} from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RightTileLayout — master window on the RIGHT, stack column on the LEFT.
 * Orientation is fixed to horizontal (no vertical variant).
 *
 * Phase guide:
 *  0  – init (all hidden)
 *  1  – window 1 (full screen)
 *  2  – 2 windows: master right, stack left
 *  3  – 3 windows: master right, stack top-left, stack bottom-left
 *  4  – swap: window 1 ↔ window 3
 *  5  – return swap
 *  6  – 2 windows (window 3 gone)
 *  7  – 1 window  (window 2 gone)
 *  8  – hidden
 */
export function RightTileLayout() {
	const containerRef = useRef<HTMLDivElement>(null);
	const r1 = useRef<HTMLDivElement>(null);
	const r2 = useRef<HTMLDivElement>(null);
	const r3 = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	// Apply CSS transition once on mount
	useEffect(() => {
		for (const ref of [r1, r2, r3]) {
			if (ref.current) ref.current.style.transition = CARD_TRANSITION;
		}
	}, []);

	// Position cards whenever phase changes
	useEffect(() => {
		const update = () => {
			const container = containerRef.current;
			if (!container) return;

			const { clientWidth: width, clientHeight: height } = container;
			const GAP = 16;
			const halfW = (width - GAP) / 2;
			const halfH = (height - GAP) / 2;
			const rightX = halfW + GAP;
			const bottomY = halfH + GAP;

			const activeWindows =
				phase >= 1 && phase < 7 ? (
					phase >= 3 && phase <= 5 ? 3
					: phase >= 2 ? 2
					: 1
				)
				: phase >= 7 ? 1
				: 0;

			const isSwap = phase === 4;

			const focusedWindow =
				phase <= 1 ? 1
				: phase === 2 ? 2
				: phase <= 5 ? 3
				: phase === 6 ? 2
				: 1;

			// Positions: master (right) and two left-column stack slots
			let master: Rect;
			let stackTop: Rect;
			let stackBottom: Rect;

			if (activeWindows === 1) {
				master = { x: 0, y: 0, w: width, h: height };
				stackTop = { x: 0, y: 0, w: halfW, h: height };
				stackBottom = { x: 0, y: bottomY, w: halfW, h: halfH };
			} else if (activeWindows === 2) {
				master = { x: rightX, y: 0, w: halfW, h: height };
				stackTop = { x: 0, y: 0, w: halfW, h: height };
				stackBottom = { x: 0, y: bottomY, w: halfW, h: halfH };
			} else {
				master = { x: rightX, y: 0, w: halfW, h: height };
				stackTop = { x: 0, y: 0, w: halfW, h: halfH };
				stackBottom = { x: 0, y: bottomY, w: halfW, h: halfH };
			}

			// ── Window 1 (master) ─────────────────────────────────────────────
			setCard(
				r1.current,
				isSwap && activeWindows === 3 ? stackBottom : master,
				phase > 0 && phase < 8,
				focusedWindow === 1,
			);

			// ── Window 2 (stack-top) ──────────────────────────────────────────
			setCard(r2.current, stackTop, phase >= 2 && phase < 7, focusedWindow === 2);

			// ── Window 3 (stack-bottom) ───────────────────────────────────────
			// When not yet visible, pre-position at its eventual entry slot
			const w3Pos =
				phase >= 3 && phase < 6 ? (
					isSwap ? master : stackBottom
				)
				: stackBottom; // pre/post position for smooth fade

			setCard(r3.current, w3Pos, phase >= 3 && phase < 6, focusedWindow === 3);
		};

		update();

		const ro = new ResizeObserver(update);
		if (containerRef.current) ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, [phase]);

	// Animation loop
	useEffect(() => {
		const timeouts = TIMINGS.map(({ phase: p, delay }) =>
			setTimeout(() => setPhase(p), delay),
		);
		const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
		return () => {
			timeouts.forEach(clearTimeout);
			clearTimeout(loop);
		};
	}, [loopKey]);

	return (
		<div ref={containerRef} className="relative h-full w-full overflow-hidden p-4">
			<div ref={r1} className="absolute opacity-0">1</div>
			<div ref={r2} className="absolute opacity-0">2</div>
			<div ref={r3} className="absolute opacity-0">3</div>
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
