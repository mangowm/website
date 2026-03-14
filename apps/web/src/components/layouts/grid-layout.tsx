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

interface GridLayoutProps {
	orientation: "horizontal" | "vertical";
}

export function GridLayout({ orientation }: GridLayoutProps) {
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

			// --- Configuration ---
			const SINGLE_PAD_V = 0.15;
			const SINGLE_PAD_H = 0.1;

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

				// --- 1. Single Window ---
				if (n === 1) {
					const w = width * (1 - SINGLE_PAD_H * 2);
					const h = height * (1 - SINGLE_PAD_V * 2);
					const x = (width - w) / 2;
					const y = (height - h) / 2;
					return [{ x, y, w, h }];
				}

				// --- 2. Double Windows ---
				if (n === 2) {
					if (orientation === "horizontal") {
						const rowH = height * (1 - SINGLE_PAD_V * 2);
						const startY = (height - rowH) / 2;
						const w = (width - gap) / 2;
						const h = rowH;
						positions.push({ x: 0, y: startY, w, h });
						positions.push({ x: w + gap, y: startY, w, h });
					} else {
						const colW = width * (1 - SINGLE_PAD_H * 2);
						const startX = (width - colW) / 2;
						const w = colW;
						const h = (height - gap) / 2;
						positions.push({ x: startX, y: 0, w, h });
						positions.push({ x: startX, y: h + gap, w, h });
					}
					return positions;
				}

				// --- 3. Standard Grid (N >= 3) ---
				let cols = 1;
				let rows = 1;

				if (orientation === "horizontal") {
					cols = Math.ceil(Math.sqrt(n));
					rows = Math.ceil(n / cols);
				} else {
					rows = Math.ceil(Math.sqrt(n));
					cols = Math.ceil(n / rows);
				}

				const totalGapW = Math.max(0, cols - 1) * gap;
				const totalGapH = Math.max(0, rows - 1) * gap;
				const cellW = (width - totalGapW) / cols;
				const cellH = (height - totalGapH) / rows;

				if (orientation === "horizontal") {
					const gridHeight = rows * cellH + (rows - 1) * gap;
					const startY = (height - gridHeight) / 2;
					for (let i = 0; i < n; i++) {
						const row = Math.floor(i / cols);
						const col = i % cols;
						const isLastRow = row === rows - 1;
						const itemsInThisRow = isLastRow ? n - row * cols : cols;
						const rowWidth =
							itemsInThisRow * cellW + (itemsInThisRow - 1) * gap;
						const rowStartX = (width - rowWidth) / 2;
						positions.push({
							x: rowStartX + col * (cellW + gap),
							y: startY + row * (cellH + gap),
							w: cellW,
							h: cellH,
						});
					}
				} else {
					const gridWidth = cols * cellW + (cols - 1) * gap;
					const startX = (width - gridWidth) / 2;
					for (let i = 0; i < n; i++) {
						const col = Math.floor(i / rows);
						const row = i % rows;
						const isLastCol = col === cols - 1;
						const itemsInThisCol = isLastCol ? n - col * rows : rows;
						const colHeight =
							itemsInThisCol * cellH + (itemsInThisCol - 1) * gap;
						const colStartY = (height - colHeight) / 2;
						positions.push({
							x: startX + col * (cellW + gap),
							y: colStartY + row * (cellH + gap),
							w: cellW,
							h: cellH,
						});
					}
				}
				return positions;
			};

			// --- Phase Logic ---
			// 0: Init
			// 1: Spawn 1
			// 2: Spawn 2
			// 3: Spawn 3
			// 4: Swap
			// 5: Return (Re-swap)
			// 6: Despawn 3
			// 7: Despawn 2
			// 8: Despawn 1

			// Active Windows Logic
			let activeWindows = 0;
			if (phase >= 1) activeWindows = 1;
			if (phase >= 2) activeWindows = 2;
			if (phase >= 3 && phase <= 5) activeWindows = 3;
			if (phase === 6) activeWindows = 2;
			if (phase >= 7) activeWindows = 1;

			// *** FIX: Swap is strictly Phase 4. Phase 5 is Return. ***
			const isSwap = phase === 4;

			// --- Focus Logic ---
			let focusedWindow = 1;
			if (phase === 2) focusedWindow = 2;
			else if (phase >= 3 && phase <= 5)
				focusedWindow = 3; // Keep focus on 3 during Swap & Return
			else if (phase === 6)
				focusedWindow = 2; // Focus 2 when 3 leaves
			else if (phase >= 7) focusedWindow = 1; // Focus 1 when 2 leaves

			const pos = calculateGrid(activeWindows);
			const prePos = calculateGrid(1)[0];

			// --- Apply Positions ---

			// Window 1
			if (activeWindows >= 1) {
				// Swap Logic: In Grid, usually 1 and 3 swap positions
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
				set(r1.current, 0, 0, width, height, false, false);
			}

			// Window 2
			if (activeWindows >= 2) {
				const p = pos[1]; // Usually stays middle
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
				set(r2.current, width, height, prePos.w / 2, prePos.h, false, false);
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
				set(r3.current, width, height, width / 2, height / 2, false, false);
			}
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
