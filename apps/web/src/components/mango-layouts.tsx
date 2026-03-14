"use client";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CenterTileLayout } from "./layouts/center-tile-layout";
import { DeckLayout } from "./layouts/deck-layout";
import { GridLayout } from "./layouts/grid-layout";
import { MonocleLayout } from "./layouts/monocle-layout";
import { OverviewLayout } from "./layouts/overview-layout";
import { RightTileLayout } from "./layouts/right-tile-layout";
import { ScrollerLayout } from "./layouts/scroller-layout";
import { TgmixLayout } from "./layouts/tgmix-layout";
import { TileLayout } from "./layouts/tile-layout";

export function MangoLayouts() {
	const [activeLayout, setActiveLayout] = useState<
		| "tiling"
		| "scroller"
		| "grid"
		| "overview"
		| "deck"
		| "center-tile"
		| "right-tile"
		| "monocle"
		| "Tgmix"
	>("tiling");
	const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
		"horizontal",
	);
	const [isAutoPlaying, setIsAutoPlaying] = useState(true);
	const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

	const isOtherActive = !["tiling", "scroller", "grid"].includes(activeLayout);

	const formatLabel = (s: string) => {
		if (s === "center-tile") return "Center Tile";
		if (s === "right-tile") return "Right Tile";
		if (s === "Tgmix") return "Tgmix";
		return s.charAt(0).toUpperCase() + s.slice(1);
	};

	const dropdownLabel = isOtherActive ? formatLabel(activeLayout) : "Others";

	// Auto-play logic
	useEffect(() => {
		if (isAutoPlaying) {
			const layouts = ["tiling", "scroller", "grid"];

			autoPlayTimerRef.current = setInterval(() => {
				setActiveLayout((current: typeof activeLayout) => {
					const currentIndex = layouts.indexOf(
						current as "tiling" | "scroller" | "grid",
					);
					if (currentIndex === -1) return "tiling"; // Reset if not in main layouts
					const nextIndex = (currentIndex + 1) % layouts.length;
					return layouts[nextIndex] as "tiling" | "scroller" | "grid";
				});
				setOrientation("horizontal");
			}, 9500);
		} else {
			if (autoPlayTimerRef.current) {
				clearInterval(autoPlayTimerRef.current);
				autoPlayTimerRef.current = null;
			}
		}

		return () => {
			if (autoPlayTimerRef.current) {
				clearInterval(autoPlayTimerRef.current);
			}
		};
	}, [isAutoPlaying]);

	// Handler functions
	const handleLayoutChange = (layout: typeof activeLayout) => {
		setActiveLayout(layout);
		setIsAutoPlaying(false);
	};

	const handleOrientationChange = (newOrientation: typeof orientation) => {
		setOrientation(newOrientation);
		setIsAutoPlaying(false);
	};

	return (
		<div className="mx-auto w-full max-w-4xl space-y-4 p-4">
			<div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
				<div className="inline-flex flex-wrap justify-end gap-1 rounded-2xl border border-border bg-muted p-1">
					<button
						type="button"
						onClick={() => handleLayoutChange("tiling")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							activeLayout === "tiling"
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Tiling
					</button>
					<button
						type="button"
						onClick={() => handleLayoutChange("scroller")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							activeLayout === "scroller"
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Scroller
					</button>
					<button
						type="button"
						onClick={() => handleLayoutChange("grid")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							activeLayout === "grid"
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Grid
					</button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								type="button"
								className={cn(
									"flex cursor-pointer items-center gap-1 rounded-full px-4 py-1.5 font-medium text-sm outline-none transition-all",
									isOtherActive
										? "bg-background text-primary shadow-sm"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{dropdownLabel}
								<ChevronDown className="h-3 w-3 opacity-50" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => handleLayoutChange("overview")}
								className="cursor-pointer"
							>
								<span
									className={cn(
										activeLayout === "overview" && "font-semibold text-primary",
									)}
								>
									Overview
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleLayoutChange("deck")}
								className="cursor-pointer"
							>
								<span
									className={cn(
										activeLayout === "deck" && "font-semibold text-primary",
									)}
								>
									Deck
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleLayoutChange("center-tile")}
								className="cursor-pointer"
							>
								<span
									className={cn(
										activeLayout === "center-tile" &&
											"font-semibold text-primary",
									)}
								>
									Center Tile
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleLayoutChange("right-tile")}
								className="cursor-pointer"
							>
								<span
									className={cn(
										activeLayout === "right-tile" &&
											"font-semibold text-primary",
									)}
								>
									Right Tile
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleLayoutChange("monocle")}
								className="cursor-pointer"
							>
								<span
									className={cn(
										activeLayout === "monocle" && "font-semibold text-primary",
									)}
								>
									Monocle
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => handleLayoutChange("Tgmix")}
								className="cursor-pointer"
							>
								<span
									className={cn(
										activeLayout === "Tgmix" && "font-semibold text-primary",
									)}
								>
									{formatLabel("Tgmix")}
								</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				<div
					className={cn(
						"inline-flex rounded-full border border-border bg-muted p-1 transition-opacity",
						isOtherActive ? "pointer-events-none opacity-50" : "",
					)}
				>
					<button
						type="button"
						onClick={() => handleOrientationChange("horizontal")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							orientation === "horizontal" && !isOtherActive
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Horizontal
					</button>
					<button
						type="button"
						onClick={() => handleOrientationChange("vertical")}
						className={cn(
							"cursor-pointer rounded-full px-4 py-1.5 font-medium text-sm transition-all",
							orientation === "vertical" && !isOtherActive
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						Vertical
					</button>
				</div>
			</div>

			<div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-border bg-background/50 shadow-sm">
				{activeLayout === "tiling" && <TileLayout orientation={orientation} />}
				{activeLayout === "scroller" && (
					<ScrollerLayout orientation={orientation} />
				)}
				{activeLayout === "grid" && <GridLayout orientation={orientation} />}
				{activeLayout === "overview" && <OverviewLayout />}
				{activeLayout === "deck" && <DeckLayout />}
				{activeLayout === "center-tile" && (
					<CenterTileLayout orientation={orientation} />
				)}
				{activeLayout === "right-tile" && <RightTileLayout />}
				{activeLayout === "monocle" && <MonocleLayout />}
				{activeLayout === "Tgmix" && <TgmixLayout orientation={orientation} />}
			</div>
		</div>
	);
}
