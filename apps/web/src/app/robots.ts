import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = "https://mangowc.vercel.app";

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [],
		},
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
