import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "../index.css";
import Providers from "@/components/providers";

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "SoftwareApplication",
	name: "MangoWC",
	description:
		"A minimal Wayland compositor inspired by dwl, featuring smooth scrolling, scratchpads, workspace overview, and rich window states.",
	applicationCategory: "DeveloperApplication",
	operatingSystem: "Linux",
	author: {
		"@type": "Person",
		name: "DreamMaoMao",
		url: "https://github.com/DreamMaoMao",
	},
	codeRepository: "https://github.com/DreamMaoMao/mangowc",
	downloadUrl: "https://github.com/DreamMaoMao/mangowc/releases",
	softwareVersion: "latest",
	license: "https://github.com/DreamMaoMao/mangowc/blob/main/LICENSE",
	keywords: "wayland, compositor, window manager, dwl, lightweight, linux",
	aggregateRating: {
		"@type": "AggregateRating",
		ratingValue: "4.5", // Placeholder, based on GitHub stars
		ratingCount: "944", // From GitHub
	},
};

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "MangoWC - Lightweight Wayland Compositor",
	description:
		"A minimal Wayland compositor inspired by dwl, featuring smooth scrolling, scratchpads, workspace overview, and rich window states for a productive desktop experience.",
	keywords: [
		"wayland compositor",
		"window manager",
		"dwl",
		"lightweight",
		"linux",
		"tiling wm",
		"wayland",
		"scroller layout",
		"master stack",
		"animations",
		"xwayland",
	],
	openGraph: {
		title: "MangoWC - Lightweight Wayland Compositor",
		description:
			"A minimal Wayland compositor inspired by dwl, featuring smooth scrolling, scratchpads, workspace overview, and rich window states.",
		url: "https://mangowc.vercel.app",
		siteName: "MangoWC",
		images: [
			{
				url: "https://opeheybxdg2xe4zd.public.blob.vercel-storage.com/logo.png",
				width: 1200,
				height: 630,
				alt: "MangoWC Logo",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "MangoWC - Lightweight Wayland Compositor",
		description:
			"A minimal Wayland compositor inspired by dwl, featuring smooth scrolling, scratchpads, workspace overview, and rich window states.",
		images: [
			"https://opeheybxdg2xe4zd.public.blob.vercel-storage.com/logo.png",
		],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	alternates: {
		canonical: "https://mangowc.vercel.app",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<body className={"font-sans antialiased"}>
				<a
					href="#main"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
				>
					Skip to main content
				</a>
				<Providers>{children}</Providers>
				<Analytics />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd),
					}}
				/>
			</body>
		</html>
	);
}
