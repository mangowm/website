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

// ─── Types ────────────────────────────────────────────────────────────────────

interface WindowOptions {
	/** Position on the primary axis as a percentage of the total track length */
	primaryOffset: number;
	/** Size on the primary axis as a percentage of the total track length */
	primarySize: number;
	/** Position on the secondary axis (0 = start, 50 = second half). Default 0 */
	secondaryOffset?: number;
	/** Size on the secondary axis as a percentage of the secondary dimension. Default 100 */
	secondarySize?: number;
	visible?: boolean;
	active?: boolean;
}

interface ScrollerLayoutProps {
	orientation: "horizontal" | "vertical";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HALF = 50; // percentage

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ScrollerLayout — windows live on a scrollable track that can extend to 1.5×
 * the container size. Phase 3 shows all three windows side-by-side by
 * expanding the track, then the viewport "scrolls" to centre the active one.
 *
 * Phase guide:
 *  0  – init (all hidden)
 *  1  – 1 window (centred)
 *  2  – 2 windows (50/50 split)
 *  3  – 3 windows side-by-side (track expands, scrolls to right)
 *  4  – stack: windows 2 & 3 stacked on the right, window 3 focused
 *  5  – unstack: window 3 expands to full secondary size on the right
 *  6  – window 3 fades out, window 2 fades in at full secondary size
 *  7  – 1 window (centred), window 2 gone
 *  8  – hidden
 */
export function ScrollerLayout({ orientation }: ScrollerLayoutProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const leftRef = useRef<HTMLDivElement>(null);
	const centerRef = useRef<HTMLDivElement>(null);
	const rightRef = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	// Apply CSS transitions once on mount
	useEffect(() => {
		for (const ref of [leftRef, centerRef, rightRef]) {
			if (ref.current) ref.current.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
		}
		if (trackRef.current) {
			trackRef.current.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
			trackRef.current.style.willChange = "width, height, transform";
		}
	}, []);

	// Position cards and track whenever phase or orientation changes
	useEffect(() => {
		const update = () => {
			const container = containerRef.current;
			const track = trackRef.current;
			if (!container || !track) return;

			const { clientWidth: width, clientHeight: height } = container;
			const isVert = orientation === "vertical";
			const dim = isVert ? height : width; // primary axis dimension

			const GAP = Math.min(20, dim * 0.05);

			// Only phase 3 needs the extended track (windows at 0%, 50%, 100%)
			const isExpandedTrack = phase === 3;
			const trackMult = isExpandedTrack ? 1.5 : 1.0;

			// Reset and re-apply track dimensions to avoid stale cross-axis values
			track.style.width = "";
			track.style.height = "";
			track.style.transform = "";
			track.style.position = "absolute";
			track.style.top = "0";
			track.style.left = "0";

			if (isVert) {
				track.style.width = "100%";
				track.style.height = `${height * trackMult}px`;
			} else {
				track.style.width = `${width * trackMult}px`;
				track.style.height = "100%";
			}

			// Scroll offset: only phase 3 actually scrolls (to the 50% mark)
			const scrollPct = phase === 3 ? HALF : 0;
			const scrollPx = (dim * scrollPct) / 100;

			track.style.transform = isVert
				? `translateY(-${scrollPx}px)`
				: `translateX(-${scrollPx}px)`;

			/**
			 * Positions a window element using percentage-based coordinates on the
			 * primary axis, and either full-width or tile-split on the secondary axis.
			 */
			const setWindow = (el: HTMLDivElement | null, opts: WindowOptions) => {
				if (!el) return;

				const {
					primaryOffset,
					primarySize,
					secondaryOffset = 0,
					secondarySize = 100,
					visible = true,
					active = false,
				} = opts;

				// Primary axis (accounts for viewport scroll position via scrollPct)
				const isFirst = primaryOffset === scrollPct;
				const isLast = primaryOffset + primarySize === scrollPct + 100;

				const rawPos = (dim * primaryOffset) / 100;
				const rawSize = (dim * primarySize) / 100;

				const pos = isFirst ? rawPos : rawPos + GAP / 2;
				let size = rawSize;
				if (!isFirst) size -= GAP / 2;
				if (!isLast) size -= GAP / 2;
				size = Math.max(size, 0);

				// Secondary axis (tile-split or full)
				const secDim = isVert ? width : height;
				let secPos: number;
				let secSize: number;

				if (secondarySize < 100) {
					const half = (secDim - GAP) / 2;
					secPos = secondaryOffset === 0 ? 0 : half + GAP;
					secSize = half;
				} else {
					secPos = 0;
					secSize = secDim;
				}

				el.style.position = "absolute";
				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";
				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);

				if (isVert) {
					el.style.left = `${secPos}px`;
					el.style.width = `${secSize}px`;
					el.style.top = `${pos}px`;
					el.style.height = `${size}px`;
				} else {
					el.style.top = `${secPos}px`;
					el.style.height = `${secSize}px`;
					el.style.left = `${pos}px`;
					el.style.width = `${size}px`;
				}
			};

			// ── Phase states ──────────────────────────────────────────────────

			if (phase === 0) {
				setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: false });
				setWindow(centerRef.current, { primaryOffset: 100, primarySize: HALF, visible: false });
				setWindow(rightRef.current, { primaryOffset: 200, primarySize: HALF, visible: false });

			} else if (phase === 1) {
				// Single window, centred at 25%
				setWindow(leftRef.current, { primaryOffset: 25, primarySize: HALF, visible: true, active: true });
				setWindow(centerRef.current, { primaryOffset: 100, primarySize: HALF, visible: false });
				setWindow(rightRef.current, { primaryOffset: 200, primarySize: HALF, visible: false });

			} else if (phase === 2) {
				// 50/50 split
				setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
				setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: true, active: true });
				setWindow(rightRef.current, { primaryOffset: 200, primarySize: HALF, visible: false });

			} else if (phase === 3) {
				// All three windows side-by-side; track extends and scrolls to HALF
				setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
				setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: true });
				setWindow(rightRef.current, { primaryOffset: 100, primarySize: HALF, visible: true, active: true });

			} else if (phase === 4) {
				// Stack: window 1 left, windows 2 & 3 stacked on the right
				setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
				setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, secondaryOffset: 0, secondarySize: HALF, visible: true });
				setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, secondaryOffset: HALF, secondarySize: HALF, visible: true, active: true });

			} else if (phase === 5) {
				// Unstack: window 3 expands to full-height right; window 2 hides off-screen
				setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
				setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: true, active: true });
				setWindow(centerRef.current, { primaryOffset: 100, primarySize: HALF, visible: false });

			} else if (phase === 6) {
				// Window 3 out, window 2 in at full-height right side
				setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
				setWindow(leftRef.current, { primaryOffset: 0, primarySize: HALF, visible: true });
				setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: true, active: true });

			} else if (phase === 7) {
				// Back to 1 window centred
				setWindow(leftRef.current, { primaryOffset: 25, primarySize: HALF, visible: true, active: true });
				setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
				setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });

			} else if (phase === 8) {
				// All hidden
				setWindow(leftRef.current, { primaryOffset: 25, primarySize: HALF, visible: false });
				setWindow(centerRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
				setWindow(rightRef.current, { primaryOffset: HALF, primarySize: HALF, visible: false });
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
		<div ref={containerRef} className="relative h-full w-full overflow-hidden">
			<div ref={trackRef} className="absolute top-0 left-0 h-full w-full">
				<div ref={leftRef} className="absolute opacity-0">1</div>
				<div ref={centerRef} className="absolute opacity-0">2</div>
				<div ref={rightRef} className="absolute opacity-0">3</div>
			</div>
		</div>
	);
}
