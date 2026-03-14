"use client";

import { RootProvider } from "fumadocs-ui/provider/next";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<RootProvider
			search={{
				enabled: true,
				hotKey: [
					{ display: "Ctrl + K", key: (e) => e.ctrlKey && e.key === "k" },
				],
			}}
		>
			{children}
		</RootProvider>
	);
}
