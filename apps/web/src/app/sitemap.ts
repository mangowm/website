import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/metadata";
import { source } from "@/lib/source";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const docsPages = source.getPages().map((page) => ({
		url: `${baseUrl.toString()}/docs/${page.slugs.join("/")}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	return [
		{
			url: baseUrl.toString(),
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		...docsPages,
	];
}
