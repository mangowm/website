"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CARD_ACTIVE, CARD_BASE, CARD_INACTIVE } from "./constants";

const MONOCLE_TIMINGS = [
	{ phase: 0, delay: 0 },
	{ phase: 1, delay: 500 },
	{ phase: 2, delay: 1500 },
	{ phase: 7, delay: 2500 },
	{ phase: 8, delay: 3500 },
];
const MONOCLE_DURATION = 6500;

export function MonocleLayout() {
	const containerRef = useRef<HTMLDivElement>(null);
	const r1 = useRef<HTMLDivElement>(null);
	const r2 = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState(0);
	const [loopKey, setLoopKey] = useState(0);

	// Setup Transitions
	useEffect(() => {
		[r1, r2].forEach((ref) => {
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

			const set = (
				el: HTMLDivElement | null,
				visible: boolean,
				active: boolean,
			) => {
				if (!el) return;
				// Monocle always fills the screen
				el.style.left = "0px";
				el.style.top = "0px";
				el.style.width = `${width}px`;
				el.style.height = `${height}px`;

				el.style.opacity = visible ? "1" : "0";
				el.style.transform = visible ? "scale(1)" : "scale(0.9)";
				el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
			};

			// Phase Logic (Mapped to custom timings)
			// 0: Init
			// 1: Win 1 appears
			// 2: Win 2 appears (covers 1)
			// ... hold (implicitly phase 2) ...
			// 7: Remove Win 2
			// 8: Remove Win 1

			// Window 1 State
			// Visible from Phase 1 until Phase 8 (Despawn 1)
			const r1Visible = phase >= 1 && phase < 8;
			// Active if it's the top window (Phase 1 only, or when 2 is gone at Phase 7)
			const r1Active = phase === 1 || phase === 7;

			set(r1.current, r1Visible, r1Active);

			// Window 2 State
			// Visible from Phase 2 until Phase 7 (Despawn 2)
			const r2Visible = phase >= 2 && phase < 7;
			// Active whenever it is visible
			const r2Active = r2Visible;

			set(r2.current, r2Visible, r2Active);
		};

		update();
		const ro = new ResizeObserver(update);
		ro.observe(containerRef.current as Element);
		return () => ro.disconnect();
	}, [phase]);

	// Loop Timing
	useEffect(() => {
		const timeouts = MONOCLE_TIMINGS.map((t) =>
			setTimeout(() => setPhase(t.phase), t.delay),
		);
		const loop = setTimeout(() => setLoopKey((k) => k + 1), MONOCLE_DURATION);
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
			{/* DOM Order ensures r2 covers r1 */}
			<div ref={r1} className="absolute opacity-0">
				1
			</div>
			<div ref={r2} className="absolute opacity-0">
				2
			</div>
		</div>
	);
}
