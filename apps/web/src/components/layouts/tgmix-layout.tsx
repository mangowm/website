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

interface TgmixLayoutProps {
	orientation: "horizontal" | "vertical";
}

export function TgmixLayout({ orientation }: TgmixLayoutProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const r1 = useRef<HTMLDivElement>(null);
	const r2 = useRef<HTMLDivElement>(null);
	const r3 = useRef<HTMLDivElement>(null);
	const r4 = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	useEffect(() => {
		[r1, r2, r3, r4].forEach((ref) => {
			if (ref.current) {
				ref.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
			}
		});
	}, []);

	useEffect(() => {
		const update = () => {
			if (!containerRef.current) return;
			const width = containerRef.current.clientWidth;
			const height = containerRef.current.clientHeight;
			const gap = 16;

			const h_halfW = (width - gap) / 2;
			const h_halfH = (height - gap) / 2;
			const h_rightX = h_halfW + gap;
			const h_bottomY = h_halfH + gap;

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

			const SINGLE_PAD_V = 0.15;
			const SINGLE_PAD_H = 0.1;

			const calculateGrid = (n: number) => {
				if (n === 0) return [];
				const positions: { x: number; y: number; w: number; h: number }[] = [];

				if (n === 1) {
					const w = width * (1 - SINGLE_PAD_H * 2);
					const h = height * (1 - SINGLE_PAD_V * 2);
					const x = (width - w) / 2;
					const y = (height - h) / 2;
					return [{ x, y, w, h }];
				}

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

			let activeWindows = 0;
			if (phase >= 1) activeWindows = 1;
			if (phase >= 2) activeWindows = 2;
			if (phase >= 3) activeWindows = 3;
			if (phase >= 4) activeWindows = 4;
			if (phase === 7) activeWindows = 3;
			if (phase === 8) activeWindows = 2;
			if (phase >= 9) activeWindows = 1;

			let focusedWindow = 1;
			if (phase === 2)
				focusedWindow = 2; // Focus 2 when it spawns
			else if (phase === 3)
				focusedWindow = 3; // Focus 3 when it spawns
			else if (phase >= 4 && phase <= 6)
				focusedWindow = 4; // Focus 4 during spawn and swap
			else if (phase === 7)
				focusedWindow = 3; // Focus 3 when 4 despawns
			else if (phase === 8)
				focusedWindow = 2; // Focus 2 when 3 despawns
			else if (phase >= 9) focusedWindow = 1; // Focus 1 when 2 despawns

			const isSwap = phase === 5;

			const useTile = activeWindows <= 3;

			let pos: { x: number; y: number; w: number; h: number }[];

			if (useTile) {
				pos = [];
				if (activeWindows === 1) {
					pos.push({ x: 0, y: 0, w: width, h: height });
				} else if (activeWindows === 2) {
					if (isVert) {
						pos.push({ x: 0, y: 0, w: width, h: v_halfH });
						pos.push({ x: 0, y: v_bottomY, w: width, h: v_halfH });
					} else {
						pos.push({ x: 0, y: 0, w: h_halfW, h: height });
						pos.push({ x: h_rightX, y: 0, w: h_halfW, h: height });
					}
				} else if (activeWindows === 3) {
					if (isVert) {
						pos.push({ x: 0, y: 0, w: width, h: v_halfH });
						pos.push({ x: 0, y: v_bottomY, w: v_halfW, h: v_halfH });
						pos.push({ x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH });
					} else {
						pos.push({ x: 0, y: 0, w: h_halfW, h: height });
						pos.push({ x: h_rightX, y: 0, w: h_halfW, h: h_halfH });
						pos.push({ x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH });
					}
				}
			} else {
				pos = calculateGrid(activeWindows);
			}
			if (useTile) {
				let pos1: { x: number; y: number; w: number; h: number };
				let pos2: { x: number; y: number; w: number; h: number };
				let pos3: { x: number; y: number; w: number; h: number };

				if (isVert) {
					if (activeWindows === 1) {
						pos1 = { x: 0, y: 0, w: width, h: height };
						pos2 = { x: 0, y: v_bottomY, w: width, h: v_halfH };
						pos3 = { x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH };
					} else if (activeWindows === 2) {
						pos1 = { x: 0, y: 0, w: width, h: v_halfH };
						pos2 = { x: 0, y: v_bottomY, w: width, h: v_halfH };
						pos3 = { x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH };
					} else {
						pos1 = { x: 0, y: 0, w: width, h: v_halfH };
						pos2 = { x: 0, y: v_bottomY, w: v_halfW, h: v_halfH };
						pos3 = { x: v_rightX, y: v_bottomY, w: v_halfW, h: v_halfH };
					}
				} else {
					if (activeWindows === 1) {
						pos1 = { x: 0, y: 0, w: width, h: height };
						pos2 = { x: h_rightX, y: 0, w: h_halfW, h: height };
						pos3 = { x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH };
					} else if (activeWindows === 2) {
						pos1 = { x: 0, y: 0, w: h_halfW, h: height };
						pos2 = { x: h_rightX, y: 0, w: h_halfW, h: height };
						pos3 = { x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH };
					} else {
						pos1 = { x: 0, y: 0, w: h_halfW, h: height };
						pos2 = { x: h_rightX, y: 0, w: h_halfW, h: h_halfH };
						pos3 = { x: h_rightX, y: h_bottomY, w: h_halfW, h: h_halfH };
					}
				}

				set(
					r1.current,
					pos1.x,
					pos1.y,
					pos1.w,
					pos1.h,
					phase > 0 && phase < 10,
					focusedWindow === 1,
				);

				set(
					r2.current,
					pos2.x,
					pos2.y,
					pos2.w,
					pos2.h,
					phase >= 2 && phase < 9,
					focusedWindow === 2,
				);

				set(
					r3.current,
					pos3.x,
					pos3.y,
					pos3.w,
					pos3.h,
					phase >= 3 && phase < 8,
					focusedWindow === 3,
				);
				set(r4.current, width, height, width / 2, height / 2, false, false);
			} else {
				const gridPos = calculateGrid(activeWindows);

				let w1Pos = gridPos[0];
				if (isSwap && focusedWindow === 4) w1Pos = gridPos[3];
				set(
					r1.current,
					w1Pos.x,
					w1Pos.y,
					w1Pos.w,
					w1Pos.h,
					phase >= 4 && phase < 7,
					focusedWindow === 1,
				);

				set(
					r2.current,
					gridPos[1].x,
					gridPos[1].y,
					gridPos[1].w,
					gridPos[1].h,
					phase >= 2 && phase < 9,
					focusedWindow === 2,
				);

				set(
					r3.current,
					gridPos[2].x,
					gridPos[2].y,
					gridPos[2].w,
					gridPos[2].h,
					phase >= 3 && phase < 8,
					focusedWindow === 3,
				);

				let w4Pos = gridPos[3];
				if (isSwap && focusedWindow === 4) w4Pos = gridPos[0];
				set(
					r4.current,
					w4Pos.x,
					w4Pos.y,
					w4Pos.w,
					w4Pos.h,
					phase >= 4 && phase < 7,
					focusedWindow === 4,
				);
			}
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(containerRef.current as Element);
		return () => ro.disconnect();
	}, [phase, orientation]);

	const extendedTimings = [
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
	];
	useEffect(() => {
		const timeouts = extendedTimings.map((t) =>
			setTimeout(() => setPhase(t.phase), t.delay),
		);
		const loop = setTimeout(() => setLoopKey((k) => k + 1), 10500);
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
			<div ref={r4} className="absolute opacity-0">
				4
			</div>
		</div>
	);
}
