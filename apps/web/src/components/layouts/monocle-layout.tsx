"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CARD_ACTIVE, CARD_BASE, CARD_INACTIVE, CARD_TRANSITION } from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 0 | 1 | 2 | 7 | 8;

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMINGS: { phase: Phase; delay: number }[] = [
	{ phase: 0, delay: 0 },
	{ phase: 1, delay: 500 },
	{ phase: 2, delay: 1500 },
	{ phase: 7, delay: 2500 },
	{ phase: 8, delay: 3500 },
];

const TOTAL_DURATION = 6500;

// ─── Component ────────────────────────────────────────────────────────────────

export function MonocleLayout() {
	const containerRef = useRef<HTMLDivElement>(null);
	const r1 = useRef<HTMLDivElement>(null);
	const r2 = useRef<HTMLDivElement>(null);

	const [phase, setPhase] = useState<Phase>(0);
	const [loopKey, setLoopKey] = useState(0);

	// Apply CSS transition once on mount
	useEffect(() => {
		for (const ref of [r1, r2]) {
			if (ref.current) ref.current.style.transition = CARD_TRANSITION;
		}
	}, []);

	// Position cards whenever phase changes
	useEffect(() => {
		const update = () => {
			const container = containerRef.current;
			if (!container) return;

			const { clientWidth: w, clientHeight: h } = container;

			// Monocle: every card always fills the full container
			for (const ref of [r1, r2]) {
				const el = ref.current;
				if (!el) continue;
				el.style.left = "0px";
				el.style.top = "0px";
				el.style.width = `${w}px`;
				el.style.height = `${h}px`;
			}

			// Phase guide:
			//  0 – init (all hidden)
			//  1 – window 1 visible & active
			//  2 – window 2 appears on top of window 1
			//  7 – window 2 removed
			//  8 – window 1 removed

			const r1Visible = phase >= 1 && phase < 8;
			const r1Active = phase === 1 || phase === 7;
			applyVisibility(r1.current, r1Visible, r1Active);

			const r2Visible = phase >= 2 && phase < 7;
			applyVisibility(r2.current, r2Visible, r2Visible /* active = visible */);
		};

		update();

		const ro = new ResizeObserver(update);
		if (containerRef.current) ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, [phase]);

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
			{/* DOM order: r2 renders above r1 when both are visible */}
			<div ref={r1} className="absolute opacity-0">1</div>
			<div ref={r2} className="absolute opacity-0">2</div>
		</div>
	);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyVisibility(
	el: HTMLDivElement | null,
	visible: boolean,
	active: boolean,
) {
	if (!el) return;
	el.style.opacity = visible ? "1" : "0";
	el.style.transform = visible ? "scale(1)" : "scale(0.9)";
	el.className = cn(CARD_BASE, active ? CARD_ACTIVE : CARD_INACTIVE);
}
