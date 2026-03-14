"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	CARD_ACTIVE,
	CARD_BASE,
	CARD_INACTIVE,
	TIMINGS,
	TOTAL_DURATION,
} from "./constants";

export function DeckLayout() {
	const containerRef = useRef<HTMLDivElement>(null);
	const r1 = useRef<HTMLDivElement>(null);
	const r2 = useRef<HTMLDivElement>(null);
	const r3 = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	// Setup Transitions
	useEffect(() => {
		[r1, r2, r3].forEach((ref) => {
			if (ref.current) {
				ref.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
			}
		});
	}, []);

	// Main Logic
	useEffect(() => {
		const update = () => {
			if (!containerRef.current) return;
			const width = containerRef.current.clientWidth;
			const height = containerRef.current.clientHeight;
			const gap = 16;

			const set = (
				el: HTMLDivElement | null,
				x: number,
				y: number,
				w: number,
				h: number,
				visible: boolean,
				active: boolean,
				zIndex: number,
			) => {
				if (!el) return;
				el.style.left = `${x}px`;
				el.style.top = `${y}px`;
				el.style.width = `${w}px`;
				el.style.height = `${h}px`;
				el.style.zIndex = `${zIndex}`;
				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";
				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
			};

			// Fixed Horizontal Tile Configuration
			const halfW = (width - gap) / 2;
			const masterRect = { x: 0, y: 0, w: halfW, h: height };
			const stackRect = { x: halfW + gap, y: 0, w: halfW, h: height };

			// --- Phase Logic ---
			// 0: Init
			// 1: Spawn 1
			// 2: Spawn 2
			// 3: Spawn 3
			// 4: Swap
			// 5: Return
			// 6: Despawn 3 (Active=2)
			// 7: Despawn 2 (Active=1, Full Screen)
			// 8: Despawn 1

			let activeWindows = 0;
			let isSwap = false;

			if (phase === 0) activeWindows = 1;
			else if (phase === 1) activeWindows = 1;
			else if (phase === 2) activeWindows = 2;
			else if (phase >= 3 && phase <= 5) activeWindows = 3;
			else if (phase === 6) activeWindows = 2;
			else if (phase === 7) activeWindows = 1;
			else if (phase === 8) activeWindows = 1;

			if (phase === 4) isSwap = true;

			// --- Focus Logic ---
			let focusedWindow = 1;
			if (phase === 2) focusedWindow = 2;
			else if (phase >= 3 && phase <= 5)
				focusedWindow = 3; // Focus 3 during Swap/Return
			else if (phase === 6) focusedWindow = 2;
			else if (phase >= 7) focusedWindow = 1;

			// --- Z-Index Logic ---
			// Base Z: 1 < 2 < 3
			// Rule 1: If Swapping, 1 > 2 (so 1 doesn't slide under 2)
			// Rule 2: Active Window gets huge boost (+20) to always be on top
			const getZIndex = (id: number) => {
				let z = id; // Base: 1, 2, 3

				// Swap Rule: Window 1 sits above Window 2
				if (id === 1 && isSwap) z = 10;

				// Active Rule: Focused window is always highest
				if (focusedWindow === id) z += 20;

				return z;
			};

			// --- Apply Positions ---

			// Window 1 (Master)
			if (phase < 8) {
				// Logic: N=1 (Phase 0,1,7,8) -> Full Screen. Else Master Rect.
				const isFull = activeWindows === 1;
				const target = isFull
					? { x: 0, y: 0, w: width, h: height }
					: masterRect;

				const p = isSwap ? stackRect : target;

				set(
					r1.current,
					p.x,
					p.y,
					p.w,
					p.h,
					phase >= 1,
					focusedWindow === 1,
					getZIndex(1),
				);
			} else {
				set(r1.current, 0, 0, width, height, false, false, 1);
			}

			// Window 2 (Stack Bottom)
			if (phase < 7) {
				const target = stackRect;
				set(
					r2.current,
					target.x,
					target.y,
					target.w,
					target.h,
					phase >= 2,
					focusedWindow === 2,
					getZIndex(2),
				);
			} else {
				set(r2.current, width, 0, halfW, height, false, false, 2);
			}

			// Window 3 (Stack Top)
			if (phase < 6) {
				const p = isSwap ? masterRect : stackRect;
				set(
					r3.current,
					p.x,
					p.y,
					p.w,
					p.h,
					phase >= 3,
					focusedWindow === 3,
					getZIndex(3),
				);
			} else {
				set(r3.current, width, 0, halfW, height, false, false, 3);
			}
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(containerRef.current as Element);
		return () => ro.disconnect();
	}, [phase]);

	// Loop Timing
	useEffect(() => {
		const timeouts = TIMINGS.map((t) =>
			setTimeout(() => setPhase(t.phase), t.delay),
		);
		const loop = setTimeout(() => setLoopKey((k) => k + 1), TOTAL_DURATION);
		return () => {
			timeouts.forEach(clearTimeout);
			clearTimeout(loop);
		};
	}, [loopKey]);

	return (
		<div
			ref={containerRef}
			className="relative h-full w-full overflow-hidden p-4"
		>
			<div ref={r1} className="absolute opacity-0">
				1
			</div>
			<div ref={r2} className="absolute opacity-0">
				2
			</div>
			<div ref={r3} className="absolute opacity-0">
				3
			</div>
		</div>
	);
}
