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

export function OverviewLayout() {
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
			const fullWidth = containerRef.current.clientWidth;
			const fullHeight = containerRef.current.clientHeight;

			// --- Configuration ---
			const GAP = 10;
			const PADDING_RATIO = 0.15;

			// Effective drawing area
			const availableW = fullWidth * (1 - PADDING_RATIO * 2);
			const availableH = fullHeight * (1 - PADDING_RATIO * 2);
			const startX = fullWidth * PADDING_RATIO;
			const startY = fullHeight * PADDING_RATIO;

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

			const calculateGrid = (n: number) => {
				if (n === 0) return [];
				const positions: { x: number; y: number; w: number; h: number }[] = [];

				// Horizontal Grid Logic (Row-Major)
				const cols = Math.ceil(Math.sqrt(n));
				const rows = Math.ceil(n / cols);

				// Calculate Cell Dimensions
				const totalGapW = Math.max(0, cols - 1) * GAP;
				const totalGapH = Math.max(0, rows - 1) * GAP;

				const cellW = (availableW - totalGapW) / cols;
				let cellH = (availableH - totalGapH) / rows;

				// Aspect Ratio Constraint
				const MAX_ASPECT_RATIO = 0.65;
				if (cellH > cellW * MAX_ASPECT_RATIO) {
					cellH = cellW * MAX_ASPECT_RATIO;
				}

				const gridContentHeight = rows * cellH + (rows - 1) * GAP;
				const gridOffsetY = startY + (availableH - gridContentHeight) / 2;

				for (let i = 0; i < n; i++) {
					const row = Math.floor(i / cols);
					const col = i % cols;

					const isLastRow = row === rows - 1;
					const itemsInThisRow = isLastRow ? n - row * cols : cols;

					const rowContentWidth =
						itemsInThisRow * cellW + (itemsInThisRow - 1) * GAP;
					const rowOffsetX = startX + (availableW - rowContentWidth) / 2;

					positions.push({
						x: rowOffsetX + col * (cellW + GAP),
						y: gridOffsetY + row * (cellH + GAP),
						w: cellW,
						h: cellH,
					});
				}

				return positions;
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

			let activeWindows = 0;
			let isSwap = false;

			if (phase === 0) activeWindows = 1;
			else if (phase === 1) activeWindows = 1;
			else if (phase === 2) activeWindows = 2;
			else if (phase >= 3 && phase <= 6) activeWindows = 3;
			else if (phase === 7) activeWindows = 2;
			else if (phase === 8) activeWindows = 1;

			// Swap only active in Phase 4
			if (phase === 4) isSwap = true;

			// --- Focus Logic ---
			let focusedWindow = 1;
			if (phase === 2) focusedWindow = 2;
			else if (phase >= 3 && phase <= 5) focusedWindow = 3;
			else if (phase === 6) focusedWindow = 2;
			else if (phase >= 7) focusedWindow = 1;

			const pos = calculateGrid(activeWindows);
			// Calculate N=1 pos for entry animations
			const prePos = calculateGrid(1)[0];

			// Apply Positions
			// Window 1
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
				set(r1.current, 0, 0, fullWidth, fullHeight, false, false);
			}

			// Window 2
			if (activeWindows >= 2) {
				const p = pos[1];
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
				// Enter from right
				set(r2.current, fullWidth, 0, prePos.w, prePos.h, false, false);
			}

			// Window 3
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
				// Enter from bottom/center
				set(
					r3.current,
					fullWidth / 2,
					fullHeight,
					prePos.w,
					prePos.h,
					false,
					false,
				);
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
