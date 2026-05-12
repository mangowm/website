import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { HmOptions, NixosOptions } from "@/components/nix-options";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    HmOptions,
    NixosOptions,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
