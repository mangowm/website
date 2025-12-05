"use client";

import Link from "next/link";
import { MangowcLayouts } from "@/components/mangowc-layouts";

export function Hero() {
	return (
		<section className="relative flex items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-10 min-h-[85vh]">
			{/* Background grid */}
			<div className="grid-bg pointer-events-none absolute inset-0 bg-[size:3rem_3rem]" />

			{/* Subtle gradient fade */}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/90" />

			<div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
				{/* Left Column */}
				<div className="flex-1 text-center lg:text-left">
					<div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
						<span className="font-mono text-xs sm:text-sm font-semibold text-primary">
							Wayland Compositor
						</span>
					</div>

					<h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
						Lightweight, <span className="text-primary">Feature-Rich</span>
					</h1>

					<p className="mx-auto mb-10 max-w-xl text-base text-muted-foreground sm:text-lg md:text-xl lg:mx-0 text-balance">
						MangoWC is a modern, lightweight, high-performance Wayland
						compositor built on dwl — crafted for speed, flexibility, and a
						customizable desktop experience.
					</p>

					{/* PERFECT button layout */}
					<div
						className="
						flex flex-col gap-4
						items-center
						sm:flex-row sm:justify-center
						lg:justify-start
					"
					>
						<Link
							href="https://github.com/DreamMaoMao/mangowc"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.04] hover:opacity-90"
						>
							View on GitHub
						</Link>

						<Link
							href="https://discord.gg/CPjbDxesh5"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full border border-border bg-background/60 px-8 py-3 font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							Join Discord
						</Link>
					</div>
				</div>

				{/* Right Column */}
				<div className="flex-1 w-full lg:max-w-[55%]">
					<div className="w-full">
						<MangowcLayouts />
					</div>
				</div>
			</div>
		</section>
	);
}
