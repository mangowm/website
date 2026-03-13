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

interface DeckLayoutProps {
	orientation?: "horizontal" | "vertical";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * DeckLayout — master pane + a single stack slot where windows overlap (deck).
 *
 * Horizontal: master left,  stack right.
 * Vertical:   master top,   stack bottom.
 *
 * The "deck" mechanic: windows 2 and 3 share the same stack slot and are
 * layered via z-index — the focused one floats on top.
 */
export function DeckLayout({ orientation = "horizontal" }: DeckLayoutProps) {
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

	// Position cards whenever phase or orientation changes
	useEffect(() => {
		const update = () => {
			const container = containerRef.current;
			if (!container) return;

			const { clientWidth: width, clientHeight: height } = container;
			const GAP = 16;
			const isVert = orientation === "vertical";

			// Two slots: master and stack (shared by all stack windows)
			const masterRect: Rect = isVert
				? { x: 0, y: 0, w: width, h: (height - GAP) / 2 }
				: { x: 0, y: 0, w: (width - GAP) / 2, h: height };

			const stackRect: Rect = isVert
				? { x: 0, y: (height - GAP) / 2 + GAP, w: width, h: (height - GAP) / 2 }
				: { x: (width - GAP) / 2 + GAP, y: 0, w: (width - GAP) / 2, h: height };

			// Off-screen exit direction (right for horizontal, bottom for vertical)
			const exitRect: Rect = isVert
				? { x: 0, y: height, w: width, h: (height - GAP) / 2 }
				: { x: width, y: 0, w: (width - GAP) / 2, h: height };

			// Phase guide:
			//  0–1  – 1 window (full screen)
			//  2    – 2 windows
			//  3–5  – 3 windows (4: swap, 5: return)
			//  6    – 2 windows (window 3 gone)
			//  7–8  – 1 window  (full screen, window 2 gone)

			const activeWindows =
				phase <= 1 ? 1
				: phase === 2 ? 2
				: phase <= 5 ? 3
				: phase === 6 ? 2
				: 1;

			const isSwap = phase === 4;

			const focusedWindow =
				phase <= 1 ? 1
				: phase === 2 ? 2
				: phase <= 5 ? 3
				: phase === 6 ? 2
				: 1;

			// z-index: base layer order + active window floats above all
			const getZ = (id: number) => {
				let z = id;
				if (id === 1 && isSwap) z = 10; // prevent sliding under w2 during swap
				if (focusedWindow === id) z += 20;
				return z;
			};

			// ── Window 1 ──────────────────────────────────────────────────────
			if (phase < 8) {
				const fullScreen: Rect = { x: 0, y: 0, w: width, h: height };
				const base = activeWindows === 1 ? fullScreen : masterRect;
				const target = isSwap ? stackRect : base;
				setCard(r1.current, target, phase >= 1, focusedWindow === 1, getZ(1));
			} else {
				setCard(r1.current, { x: 0, y: 0, w: width, h: height }, false, false, 1);
			}

			// ── Window 2 ──────────────────────────────────────────────────────
			if (phase < 7) {
				setCard(r2.current, stackRect, phase >= 2, focusedWindow === 2, getZ(2));
			} else {
				setCard(r2.current, exitRect, false, false, 2);
			}

			// ── Window 3 ──────────────────────────────────────────────────────
			if (phase < 6) {
				const target = isSwap ? masterRect : stackRect;
				setCard(r3.current, target, phase >= 3, focusedWindow === 3, getZ(3));
			} else {
				setCard(r3.current, exitRect, false, false, 3);
			}
		};

		update();

		const ro = new ResizeObserver(update);
		if (containerRef.current) ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, [phase, orientation]);

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
	zIndex: number,
) {
	if (!el) return;
	el.style.left = `${x}px`;
	el.style.top = `${y}px`;
	el.style.width = `${w}px`;
	el.style.height = `${h}px`;
	el.style.zIndex = String(zIndex);
	el.style.opacity = visible ? "1" : "0";
	el.style.transform = visible ? "scale(1)" : "scale(0.9)";
	el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
}
