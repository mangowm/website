import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig = {
	output: "export",
	trailingSlash: true,
	reactCompiler: false,
	compress: true,
	serverExternalPackages: ["@takumi-rs/image-response"],
	images: {
		unoptimized: true,
	},
};

export default withMDX(nextConfig);
