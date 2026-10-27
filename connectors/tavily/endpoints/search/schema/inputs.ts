import { z } from "zod";

/**
 * POST /search body - docs.tavily.com api-reference/endpoint/search
 * (read 2026-10-23). Mirror carries optionality and vendor bounds only
 * (D25); defaults live at the binding.
 *
 * `country` is a 100+ entry vendor enum of lowercase English country
 * names; it is mirrored as a string so a new vendor entry never fails
 * validation here.
 */
export const zTavilySearchBody = z.looseObject({
    query: z.string().min(1).describe("The search query to execute."),
    search_depth: z.enum(["advanced", "basic", "fast", "ultra-fast"])
        .describe(
            "Latency vs relevance. 'advanced' costs 2 credits and returns " +
                "the most relevant snippets; 'basic', 'fast' and " +
                "'ultra-fast' cost 1 credit. 'ultra-fast' returns one NLP " +
                "summary per URL instead of snippets.",
        ).optional(),
    chunks_per_source: z.number().int().min(1).max(3).describe(
        "Max content snippets per result (about 500 characters each, 800 " +
            "for 'advanced'). Not available for 'ultra-fast'.",
    ).optional(),
    max_results: z.number().int().min(0).max(20).describe(
        "Maximum number of results (0-20, vendor default 10). Does not " +
            "change the price.",
    ).optional(),
    topic: z.enum(["general", "news", "finance"]).describe(
        "Search category. 'news' targets mainstream real-time coverage.",
    ).optional(),
    time_range: z.enum(["day", "week", "month", "year", "d", "w", "m", "y"])
        .describe("Only results published or updated within this window.")
        .optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe(
        "Only results published or updated after this date (YYYY-MM-DD).",
    ).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe(
        "Only results published or updated before this date (YYYY-MM-DD).",
    ).optional(),
    include_published_date: z.boolean().describe(
        "Add a best-estimate `published_date` to each result (beta).",
    ).optional(),
    filter_by_published_date: z.boolean().describe(
        "Drop results outside the date window, including those with no " +
            "detectable date.",
    ).optional(),
    include_answer: z.union([z.boolean(), z.enum(["basic", "advanced"])])
        .describe(
            "Add an LLM-generated answer. true or 'basic' is quick; " +
                "'advanced' is more detailed.",
        ).optional(),
    include_raw_content: z.union([z.boolean(), z.enum(["markdown", "text"])])
        .describe(
            "Add each result's full cleaned page content. true or " +
                "'markdown' returns markdown; 'text' returns plain text.",
        ).optional(),
    include_images: z.boolean().describe(
        "Add query-related images and per-result images.",
    ).optional(),
    include_image_descriptions: z.boolean().describe(
        "With include_images, add a description to each image.",
    ).optional(),
    include_favicon: z.boolean().describe(
        "Add each result's favicon URL.",
    ).optional(),
    include_domains: z.array(z.string()).max(300).describe(
        "Domains to include (max 300).",
    ).optional(),
    exclude_domains: z.array(z.string()).max(150).describe(
        "Domains to exclude (max 150).",
    ).optional(),
    include_domains_mode: z.enum(["restrict", "prefer"]).describe(
        "'restrict' (vendor default) limits results to include_domains; " +
            "'prefer' only ranks them higher.",
    ).optional(),
    country: z.string().describe(
        "Boost results from this country, as a lowercase English name " +
            "('united states', 'germany'). Only for topic 'general'.",
    ).optional(),
    language: z.string().describe(
        "Boost results in this language: an ISO 639-1 code ('en', " +
            "'zh-cn') or English name.",
    ).optional(),
    filter_by_language: z.boolean().describe(
        "Drop results not in `language` instead of only ranking them lower.",
    ).optional(),
    auto_parameters: z.boolean().describe(
        "Let Tavily pick search parameters from the query. It may switch " +
            "search_depth to 'advanced' (2 credits) unless search_depth is " +
            "set explicitly.",
    ).optional(),
    exact_match: z.boolean().describe(
        "Only return results containing the quoted phrase(s) in the query.",
    ).optional(),
    include_usage: z.boolean().describe(
        "Include credit usage in the response.",
    ).optional(),
    safe_search: z.boolean().describe(
        "Filter adult or unsafe content. Not supported for 'fast' or " +
            "'ultra-fast'.",
    ).optional(),
});
