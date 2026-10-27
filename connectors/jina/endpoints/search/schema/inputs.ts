import { z } from "zod";

/**
 * `POST https://s.jina.ai/search` body — the endpoint parameters of
 * `searchIndex` plus the agent-useful `CrawlerOptions` subset
 * (s.jina.ai/openapi.json, 2026-10-23). Mirror carries optionality only
 * (D25); `tokenBudget` is required and `num` bounded at the binding.
 * `respondWith: "no-content"` is the dashboard's SERP-only mode (the
 * OpenAPI types the field as an open string).
 */
export const zJinaSearchBody = z.object({
    q: z.string().describe("Search query."),
    type: z.enum(["web", "images", "news"]).describe(
        "Result vertical (vendor default 'web').",
    ).optional(),
    num: z.number().int().describe(
        "Number of results to return (0-20; vendor default 5).",
    ).optional(),
    page: z.number().int().describe("Result page, for pagination.")
        .optional(),
    gl: z.string().describe(
        "Two-letter country code the search runs from, e.g. 'us'.",
    ).optional(),
    hl: z.string().describe(
        "Two-letter language code of the results, e.g. 'en'.",
    ).optional(),
    location: z.string().describe(
        "Location the search originates from, e.g. 'San Francisco'.",
    ).optional(),
    site: z.array(z.string()).describe(
        "Only return results from these sites, e.g. ['jina.ai'].",
    ).optional(),
    respondWith: z.enum(["no-content", "content", "markdown", "text"])
        .describe(
            "'no-content' returns titles, URLs and snippets only, without " +
                "reading each result page. Otherwise each result's page " +
                "content is included in this format (vendor default " +
                "'content').",
        ).optional(),
    retainImages: z.enum(["none", "all", "alt", "all_p", "alt_p"]).describe(
        "Which images to keep in each result's content (vendor default " +
            "'all').",
    ).optional(),
    withLinksSummary: z.boolean().describe(
        "Append a links section to each result's content.",
    ).optional(),
    noCache: z.boolean().describe(
        "Bypass Jina's cache for the search and the result pages.",
    ).optional(),
    tokenBudget: z.number().int().describe(
        "Maximum tokens this request may cost. A search that would cost " +
            "more fails with a 409 BudgetExceededError and is not billed.",
    ).optional(),
}).strict();
