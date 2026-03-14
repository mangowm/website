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

interface CenterTileLayoutProps {
	orientation: "horizontal" | "vertical";
}

export function CenterTileLayout({ orientation }: CenterTileLayoutProps) {
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

			// --- Geometry Calculations ---
			const availWidth = width - 2 * gap;
			const unit = availWidth / 4;
			const sideW = unit;
			const centerW = unit * 2;

			const xLeft = 0;
			const xCenter = sideW + gap;
			const xRight = sideW + centerW + 2 * gap;

			const getLayout = (n: number) => {
				const pos = [
					{ x: 0, y: 0, w: 0, h: 0 },
					{ x: 0, y: 0, w: 0, h: 0 },
					{ x: 0, y: 0, w: 0, h: 0 },
				];

				if (n === 1) {
					pos[0] = { x: xCenter, y: 0, w: centerW, h: height };
				} else if (n === 2) {
					pos[0] = { x: xCenter, y: 0, w: centerW, h: height };
					pos[1] = { x: xRight, y: 0, w: sideW, h: height };
				} else if (n === 3) {
					pos[0] = { x: xCenter, y: 0, w: centerW, h: height };
					pos[1] = { x: xLeft, y: 0, w: sideW, h: height };
					pos[2] = { x: xRight, y: 0, w: sideW, h: height };
				}
				return pos;
			};

			// --- Phase Logic ---
			// 0: Init
			// 1: Spawn 1
			// 2: Spawn 2
			// 3: Spawn 3
			// 4: Swap
			// 5: Return
			// 6: Despawn 3
			// 7: Despawn 2
			// 8: Despawn 1

			// Active Windows
			let activeWindows = 0;
			if (phase >= 1) activeWindows = 1;
			if (phase >= 2) activeWindows = 2;
			if (phase >= 3 && phase <= 5) activeWindows = 3;
			if (phase === 6) activeWindows = 2;
			if (phase >= 7) activeWindows = 1;

			// Swap Active (Only Phase 4)
			const isSwap = phase === 4;

			// --- Focus Logic ---
			let focusedWindow = 1;
			if (phase === 2) focusedWindow = 2;
			else if (phase >= 3 && phase <= 5)
				focusedWindow = 3; // Keep focus on 3 during Swap & Return
			else if (phase === 6) focusedWindow = 2;
			else if (phase >= 7) focusedWindow = 1;

			const pos = getLayout(activeWindows);
			const prePos = getLayout(1)[0];

			// --- Apply Positions ---

			// Window 1 (Center/Master)
			if (activeWindows >= 1) {
				const p = isSwap ? pos[2] : pos[0];
				set(
					r1.current,
					p.x,
					p.y,
					p.w,
					p.h,
					phase > 0 && phase < 8,
					focusedWindow === 1,
				);
			} else {
				set(r1.current, xCenter, 0, centerW, height, false, false);
			}

			// Window 2 (Right -> Left)
			if (activeWindows >= 2) {
				const p = pos[1]; // Stays Left/Right depending on N, unaffected by swap logic usually
				set(
					r2.current,
					p.x,
					p.y,
					p.w,
					p.h,
					phase >= 2 && phase < 7,
					focusedWindow === 2,
				);
			} else {
				set(r2.current, width, 0, sideW, height, false, false);
			}

			// Window 3 (Right)
			if (activeWindows >= 3) {
				const p = isSwap ? pos[0] : pos[2];
				set(
					r3.current,
					p.x,
					p.y,
					p.w,
					p.h,
					phase >= 3 && phase < 6,
					focusedWindow === 3,
				);
			} else {
				set(r3.current, width, 0, sideW, height, false, false);
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
