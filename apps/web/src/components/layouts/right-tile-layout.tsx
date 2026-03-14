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

export function RightTileLayout() {
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

			// Horizontal Calculations (Master Right, Stack Left)
			const h_halfW = (width - gap) / 2;
			const h_halfH = (height - gap) / 2;
			const h_rightX = h_halfW + gap;
			const h_bottomY = h_halfH + gap;

			const set = (
				el: HTMLDivElement | null,
				x: number,
				y: number,
				w: number,
				h: number,
				visible: boolean,
				active: boolean,
			) => {
				if (!el) return;
				el.style.left = `${x}px`;
				el.style.top = `${y}px`;
				el.style.width = `${w}px`;
				el.style.height = `${h}px`;

				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";
				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
			};

			// --- Phase Logic ---
			// 0: Init
			// 1: Spawn 1
			// 2: Spawn 2 (Split)
			// 3: Spawn 3 (Split Stack)
			// 4: Swap
			// 5: Re-Swap (Back to normal)
			// 6: Despawn 3
			// 7: Despawn 2
			// 8: Despawn 1

			// Determine Active Windows Count
			let activeWindows = 0;
			if (phase >= 1) activeWindows = 1;
			if (phase >= 2) activeWindows = 2;
			if (phase >= 3 && phase <= 5) activeWindows = 3;
			if (phase === 6) activeWindows = 2;
			if (phase >= 7) activeWindows = 1;

			// Is Swap State? (Only Phase 4)
			const isSwap = phase === 4;

			// Determine Focus
			let focusedWindow = 1;
			if (phase === 2) focusedWindow = 2;
			else if (phase >= 3 && phase <= 5)
				focusedWindow = 3; // Keep focus on 3 during Swap & Return
			else if (phase === 6)
				focusedWindow = 2; // Focus 2 when 3 leaves
			else if (phase >= 7) focusedWindow = 1; // Focus 1 when 2 leaves

			// --- Calculate Rects based on Horizontal Orientation ---

			// Initialize with safe defaults to prevent TypeScript errors
			let pos0 = { x: 0, y: 0, w: 0, h: 0 };
			let pos1 = { x: 0, y: 0, w: 0, h: 0 };
			let pos2 = { x: 0, y: 0, w: 0, h: 0 };

			// Horizontal Only Logic: Master Right, Stack Left
			if (activeWindows === 1) {
				pos0 = { x: 0, y: 0, w: width, h: height };
				// FIX: Pre-calculate stack positions so they fade out in place
				// instead of shrinking to 0,0
				pos1 = { x: 0, y: 0, w: h_halfW, h: height };
				pos2 = { x: 0, y: h_bottomY, w: h_halfW, h: h_halfH };
			} else if (activeWindows === 2) {
				// Master Right, Stack Left
				pos0 = { x: h_rightX, y: 0, w: h_halfW, h: height };
				pos1 = { x: 0, y: 0, w: h_halfW, h: height };
				// Pre-calc pos2 for smooth entry of window 3
				pos2 = { x: 0, y: h_bottomY, w: h_halfW, h: h_halfH };
			} else {
				// Master Right
				pos0 = { x: h_rightX, y: 0, w: h_halfW, h: height };
				// Stack Left (Split Top/Bottom)
				// Stack fills top to bottom
				pos1 = { x: 0, y: 0, w: h_halfW, h: h_halfH };
				pos2 = { x: 0, y: h_bottomY, w: h_halfW, h: h_halfH };
			}

			// --- Apply to Windows ---

			// Window 1 (Master)
			// Normal: pos0
			// Swap: pos2 (Swaps with 3rd window)
			let target1 = pos0;
			if (isSwap && activeWindows === 3) target1 = pos2;

			set(
				r1.current,
				target1.x,
				target1.y,
				target1.w,
				target1.h,
				phase > 0 && phase < 8,
				focusedWindow === 1,
			);

			// Window 2 (Stack 1)
			// Usually the "stable" stack window (Top-Left in stack area)
			// Does not move during swap
			const target2 = pos1;

			set(
				r2.current,
				target2.x,
				target2.y,
				target2.w,
				target2.h,
				phase >= 2 && phase < 7,
				focusedWindow === 2,
			);

			// Window 3 (Stack 2)
			// Normal: pos2 (Bottom/Left of stack area)
			// Swap: pos0 (Master)
			let target3 = pos2;
			if (isSwap && activeWindows === 3) target3 = pos0;

			// Pre-position for entry
			if (activeWindows < 3) {
				// Entry position: Opposite of Master (Bottom Left)
				target3 = { x: 0, y: h_bottomY, w: h_halfW, h: h_halfH };
			}

			set(
				r3.current,
				target3.x,
				target3.y,
				target3.w,
				target3.h,
				phase >= 3 && phase < 6,
				focusedWindow === 3,
			);
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
