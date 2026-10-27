import { z } from "zod";

/**
 * `POST https://r.jina.ai/` body — the agent-useful subset of
 * `CrawlerOptions` (r.jina.ai/openapi.json, 2026-10-23). Mirror carries
 * optionality only (D25); `tokenBudget` is required and `timeout` bounded
 * at the binding in endpoint.ts. Omitted: browser plumbing (cookies,
 * proxies, injected scripts, file uploads, markdown style knobs).
 */
export const zJinaReadBody = z.object({
    url: z.url({ protocol: /^https?$/ }).describe(
        "URL of the page or PDF to read.",
    ),
    respondWith: z.enum([
        "content",
        "markdown",
        "html",
        "text",
        "pageshot",
        "screenshot",
        "vlm",
        "readerlm-v2",
        "frontmatter",
        "readability",
        "jina-ocr-v1",
    ]).describe(
        "Output format. 'content' (vendor default) is the readable main " +
            "content as markdown; 'markdown' converts the whole page; " +
            "'html' and 'text' return the raw page; 'screenshot' / " +
            "'pageshot' return an image URL of the first screen / full " +
            "page. 'jina-ocr-v1' parses the rendered page with Jina's OCR " +
            "model for complex documents and costs about 40x more tokens.",
    ).optional(),
    targetSelector: z.string().describe(
        "CSS selector(s); only matching elements are extracted. Example: " +
            "'article, .main-content'.",
    ).optional(),
    waitForSelector: z.string().describe(
        "CSS selector(s) to wait for before extracting, for content that " +
            "loads dynamically.",
    ).optional(),
    removeSelector: z.string().describe(
        "CSS selector(s) removed before extraction. Example: " +
            "'nav, footer, .sidebar'.",
    ).optional(),
    withLinksSummary: z.boolean().describe(
        "Append a 'Buttons & Links' section listing the page's links.",
    ).optional(),
    withImagesSummary: z.boolean().describe(
        "Append an 'Images' section listing the page's images.",
    ).optional(),
    withGeneratedAlt: z.boolean().describe(
        "Caption images that have no alt text with a vision model.",
    ).optional(),
    retainImages: z.enum(["none", "all", "alt", "all_p", "alt_p"]).describe(
        "Which images to keep in the output (vendor default 'all'); " +
            "'none' strips them and lowers token usage.",
    ).optional(),
    engine: z.enum(["auto", "browser", "curl", "cf-browser-rendering"])
        .describe(
            "Fetch engine: 'browser' renders JavaScript (best quality), " +
                "'curl' is fastest for static pages.",
        ).optional(),
    noCache: z.boolean().describe(
        "Bypass Jina's cache and fetch the page live.",
    ).optional(),
    cacheTolerance: z.number().int().describe(
        "Accept a cached copy no older than this many seconds; 0 is the " +
            "same as noCache.",
    ).optional(),
    timeout: z.number().describe(
        "Seconds to wait for the page to load (1-180).",
    ).optional(),
    locale: z.string().describe(
        "Browser locale used to render the page, e.g. 'en-US'.",
    ).optional(),
    tokenBudget: z.number().int().describe(
        "Maximum tokens this request may cost. A page that would cost " +
            "more fails with a 409 BudgetExceededError and is not billed.",
    ).optional(),
}).strict();
