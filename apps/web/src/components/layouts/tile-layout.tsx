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

interface TileLayoutProps {
	orientation: "horizontal" | "vertical";
}

export function TileLayout({ orientation }: TileLayoutProps) {
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

			// Horizontal Calculations (Master Left, Stack Right)
			const h_halfW = (width - gap) / 2;
			const h_halfH = (height - gap) / 2;
			const h_rightX = h_halfW + gap;
			const h_bottomY = h_halfH + gap;

			// Vertical Calculations (Master Top, Stack Bottom)
			const v_halfW = (width - gap) / 2;
			const v_halfH = (height - gap) / 2;
			const v_rightX = v_halfW + gap;
			const v_bottomY = v_halfH + gap;

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

			const isVert = orientation === "vertical";

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

			// Determine Focus
			let focusedWindow = 1;
			if (phase === 2) focusedWindow = 2;
			else if (phase >= 3 && phase <= 5)
				focusedWindow = 3; // Keep focus on 3 during Swap & Return
			else if (phase === 6)
				focusedWindow = 2; // Focus 2 when 3 leaves
			else if (phase >= 7) focusedWindow = 1; // Focus 1 when 2 leaves

			// Is Swap State?
			const isSwap = phase === 4;

			// --- Calculate Rects based on Orientation ---

			// Define standard positions (Normal State)
			// Pos 0: Master
			// Pos 1: Stack 1
			// Pos 2: Stack 2
			let pos0, pos1, pos2;

			if (isVert) {
				// Vertical: Master Top
				if (activeWindows === 1) {
					pos0 = { x: 0, y: 0, w: width, h: height };
					// Pre-calculate stack positions even if unused, to prevent jumping to 0,0 on exit
					pos1 = { x: 0, y: v_bottomY, w: width, h: v_halfH };
					pos2 = { x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH };
				} else if (activeWindows === 2) {
					pos0 = { x: 0, y: 0, w: width, h: v_halfH };
					pos1 = { x: 0, y: v_bottomY, w: width, h: v_halfH };
					pos2 = { x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH };
				} else {
					pos0 = { x: 0, y: 0, w: width, h: v_halfH };
					pos1 = { x: 0, y: v_bottomY, w: v_halfW, h: v_halfH };
					pos2 = { x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH };
				}
			} else {
				// Horizontal: Master Left
				if (activeWindows === 1) {
					pos0 = { x: 0, y: 0, w: width, h: height };
					// Pre-calculate stack positions
					pos1 = { x: h_rightX, y: 0, w: h_halfW, h: height };
					pos2 = { x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH };
				} else if (activeWindows === 2) {
					pos0 = { x: 0, y: 0, w: h_halfW, h: height };
					pos1 = { x: h_rightX, y: 0, w: h_halfW, h: height };
					pos2 = { x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH };
				} else {
					pos0 = { x: 0, y: 0, w: h_halfW, h: height };
					pos1 = { x: h_rightX, y: 0, w: h_halfW, h: h_halfH };
					pos2 = { x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH };
				}
			}

			// --- Apply to Windows ---

			// Window 1
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

			// Window 2
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

			// Window 3
			let target3 = pos2;
			if (isSwap && activeWindows === 3) target3 = pos0;

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
	}, [phase, orientation]);

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
