import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [],
		},
		sitemap: `${baseUrl.toString()}/sitemap.xml`,
	};
}
