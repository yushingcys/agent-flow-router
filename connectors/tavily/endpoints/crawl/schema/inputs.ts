import { z } from "zod";
import { zTavilyTraversal } from "../../../schema/traversal.ts";

/** POST /crawl body - the shared traversal fields plus per-page extraction
 *  options (docs.tavily.com api-reference/endpoint/crawl, 2026-10-23). */
export const zTavilyCrawlBody = z.looseObject({
    ...zTavilyTraversal,
    chunks_per_source: z.number().int().min(1).max(5).describe(
        "With instructions, max relevant chunks (about 800 characters " +
            "each) per page in raw_content.",
    ).optional(),
    extract_depth: z.enum(["basic", "advanced"]).describe(
        "'advanced' also pulls tables and embedded content, with higher " +
            "success, and doubles the extraction rate to 2 credits per 5 " +
            "pages.",
    ).optional(),
    format: z.enum(["markdown", "text"]).describe(
        "Content format (vendor default 'markdown').",
    ).optional(),
    include_images: z.boolean().describe(
        "Include images found on each page.",
    ).optional(),
    include_favicon: z.boolean().describe(
        "Include each page's favicon URL.",
    ).optional(),
});
