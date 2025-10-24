"use client";

import { useState, useRef, useEffect } from "react";

const features = [
	{
		title: "Master Stack Layout",
		description:
			"Powerful tiling layout with master and stack areas for efficient window management",
		video:
			"https://opeheybxdg2xe4zd.public.blob.vercel-storage.com/master-stack-layout.mp4",
	},
	{
		title: "Scroller Layout",
		description:
			"Smooth scrolling layout for managing multiple windows with ease",
		video:
			"https://opeheybxdg2xe4zd.public.blob.vercel-storage.com/scroller-layout.mp4",
	},
	{
		title: "Layer Animation",
		description:
			"Elegant animations for window open/close, tag transitions, and layer effects",
		video:
			"https://opeheybxdg2xe4zd.public.blob.vercel-storage.com/layer-animation.mp4",
	},
];

export function Features() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			const fullscreenElement = document.fullscreenElement;
			if (!fullscreenElement) {
				// Exited fullscreen, reset all videos to muted loop autoplay without controls
				videoRefs.current.forEach((video) => {
					if (video) {
						video.controls = false;
						video.muted = true;
						video.loop = true;
					}
				});
			}
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	return (
		<section id="features" className="bg-background px-4 py-20 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="mb-16 text-center">
					<h2 className="mb-4 text-balance font-bold text-4xl text-foreground sm:text-5xl">
						Powerful Features
					</h2>
					<p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
						Advanced window management with smooth animations, flexible layouts,
						and rich window states
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
					{features.map((feature, index) => (
						<div
							key={index}
							className="group overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur transition-colors hover:border-accent/50"
						>
							<div
								className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden bg-black/50"
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								onClick={() => {
									const video = videoRefs.current[index];
									if (video) {
										video.requestFullscreen();
										video.controls = true;
										video.muted = false;
										video.loop = false;
										video.play();
									}
								}}
							>
								<video
									ref={(el) => {
										videoRefs.current[index] = el;
									}}
									src={feature.video}
									className="h-full w-full object-cover"
									muted
									loop
									autoPlay
									preload="none"
									aria-label={`${feature.title} demonstration video`}
								/>
								{hoveredIndex === index && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent transition-transform hover:scale-110">
											<svg
												className="h-6 w-6 text-accent-foreground"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
											</svg>
										</div>
									</div>
								)}
							</div>
							<div className="p-6">
								<h3 className="mb-2 font-bold text-foreground text-xl">
									{feature.title}
								</h3>
								<p className="text-muted-foreground">{feature.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
