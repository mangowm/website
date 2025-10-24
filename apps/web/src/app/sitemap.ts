import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = "https://mangowc.vercel.app";

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
	];
}
