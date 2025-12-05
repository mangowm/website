import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
	dir: "content/docs",
});

export default defineConfig({
	mdxOptions: {
		rehypeCodeOptions: {
			langs: [
				"ts",
				"js",
				"html",
				"tsx",
				"mdx",
				"ini",
				"bash",
				"nix",
				"jsonc",
				"css",
			],
			themes: {
				light: "catppuccin-latte",
				dark: "catppuccin-mocha",
			},
		},
	},
});
