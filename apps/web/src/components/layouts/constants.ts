// Animation phases and their trigger delays (ms)
export const TIMINGS = [
	{ phase: 0, delay: 0 },
	{ phase: 1, delay: 500 },
	{ phase: 2, delay: 1500 },
	{ phase: 3, delay: 2500 },
	{ phase: 4, delay: 4000 },
	{ phase: 5, delay: 5000 },
	{ phase: 6, delay: 6000 },
	{ phase: 7, delay: 7000 },
	{ phase: 8, delay: 8000 },
] as const;

export const TOTAL_DURATION = 9500;

// Shared card class fragments
export const CARD_BASE =
	"absolute flex items-center justify-center text-4xl font-bold rounded-xl transition-colors will-change-[left,top,width,height,opacity,transform]";

export const CARD_ACTIVE =
	"border-4 border-primary bg-primary/10 text-primary shadow-2xl z-20";

export const CARD_INACTIVE =
	"border-2 border-border bg-muted text-muted-foreground z-10";

// Shared CSS transition applied to every animated card ref
export const CARD_TRANSITION = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
