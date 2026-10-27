import { z } from "zod";

/**
 * The site-traversal fields /map and /crawl share (docs.tavily.com
 * api-reference/endpoint/map and /crawl, read 2026-10-23). Optionality and
 * vendor bounds only (D25).
 */
export const zTavilyTraversal = {
    url: z.string().min(1).describe(
        "Root URL to start from, e.g. 'docs.tavily.com'.",
    ),
    instructions: z.string().describe(
        "Natural-language guidance on which pages to follow. Doubles the " +
            "mapping rate to 2 credits per 10 pages.",
    ).optional(),
    max_depth: z.number().int().min(1).max(5).describe(
        "How many link hops from the root to explore (1-5, vendor " +
            "default 1).",
    ).optional(),
    max_breadth: z.number().int().min(1).max(500).describe(
        "Links to follow per page (1-500, vendor default 20).",
    ).optional(),
    limit: z.number().int().min(1).describe(
        "Total pages processed before stopping (vendor default 50). The " +
            "main cost driver.",
    ).optional(),
    select_paths: z.array(z.string()).describe(
        "Regex patterns; only URLs whose path matches are kept " +
            "('/docs/.*').",
    ).optional(),
    select_domains: z.array(z.string()).describe(
        "Regex patterns; only these domains or subdomains are kept " +
            "('^docs\\.example\\.com$').",
    ).optional(),
    exclude_paths: z.array(z.string()).describe(
        "Regex patterns for URL paths to skip.",
    ).optional(),
    exclude_domains: z.array(z.string()).describe(
        "Regex patterns for domains or subdomains to skip.",
    ).optional(),
    allow_external: z.boolean().describe(
        "Include links to external domains in the results (vendor " +
            "default true).",
    ).optional(),
    timeout: z.number().min(10).max(150).describe(
        "Seconds to wait before giving up (10-150, vendor default 150).",
    ).optional(),
    include_usage: z.boolean().describe(
        "Include Tavily's credit usage in the response. Informational: " +
            "the value may read 0 until the account's running total " +
            "reaches a billing block.",
    ).optional(),
};
