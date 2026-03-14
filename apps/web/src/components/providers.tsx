"use client";

import { RootProvider } from "fumadocs-ui/provider/next";
import SearchDialog from "./search";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<RootProvider
			theme={{
				attribute: "class",
				defaultTheme: "system",
				enableSystem: true,
				disableTransitionOnChange: true,
			}}
			search={{
				SearchDialog,
			}}
		>
			{children}
			<Toaster richColors />
		</RootProvider>
	);
}
