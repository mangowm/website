import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	compress: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "opeheybxdg2xe4zd.public.blob.vercel-storage.com",
			},
		],
		formats: ["image/webp", "image/avif"],
	},
};

export default nextConfig;
