import { docs } from "fumadocs-mdx:collections/server";
import { type InferPageType, loader } from "fumadocs-core/source";

export const source = loader(docs.toFumadocsSource(), {
	baseUrl: "/docs",
});

export type Page = InferPageType<typeof source>;
