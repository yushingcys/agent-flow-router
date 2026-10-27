import { z } from "zod";

/** POST /extract body - docs.tavily.com api-reference/endpoint/extract
 *  (read 2026-10-23). Optionality and vendor bounds only (D25). */
export const zTavilyExtractBody = z.looseObject({
    urls: z.union([
        z.string().min(1),
        z.array(z.string().min(1)).min(1).max(20),
    ])
        .describe("One URL, or a list of up to 20 URLs, to extract."),
    query: z.string().describe(
        "User intent; when set, content chunks are reranked by relevance " +
            "to it.",
    ).optional(),
    chunks_per_source: z.number().int().min(1).max(5).describe(
        "With query, max relevant chunks (about 800 characters each) per " +
            "URL in raw_content.",
    ).optional(),
    extract_depth: z.enum(["basic", "advanced"]).describe(
        "'advanced' also pulls tables and embedded content, with higher " +
            "success, and costs 2 credits per 5 successful URLs instead " +
            "of 1.",
    ).optional(),
    include_images: z.boolean().describe(
        "Include images found on each page.",
    ).optional(),
    include_favicon: z.boolean().describe(
        "Include each page's favicon URL.",
    ).optional(),
    format: z.enum(["markdown", "text"]).describe(
        "Content format (vendor default 'markdown').",
    ).optional(),
    timeout: z.number().min(1).max(60).describe(
        "Seconds to wait per extraction (1-60; vendor default 10 for " +
            "basic, 30 for advanced).",
    ).optional(),
    include_usage: z.boolean().describe(
        "Include Tavily's credit usage in the response. Informational: " +
            "the value may read 0 until the account's running total " +
            "reaches 5 successful URLs.",
    ).optional(),
});
