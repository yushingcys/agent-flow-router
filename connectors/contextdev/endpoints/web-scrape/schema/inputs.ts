import { z } from "zod";
import { zPageUrl, zZdr } from "../../../schema/common.ts";

/**
 * POST /web/scrape body - the vendor mirror
 * (docs.context.dev/api-reference/web-scraping/scrape, 2026-10-27). Not
 * carried: `tags`, and `sharedParams.profile` (its `new` arm takes the
 * target site's sign-in password). Custom parser rules are recursive rule
 * objects up to 5 levels; the mirror keeps a rule object open and the
 * vendor validates its inside.
 */

const zSelector = z.string().regex(/\S/).max(2048);

const zFormats = z.object({
    html: z.boolean().describe("Rendered HTML.").optional(),
    markdown: z.boolean().describe("Page content as Markdown.").optional(),
    screenshot: z.boolean().describe("A screenshot of the page.").optional(),
    images: z.boolean().describe("Images found on the page.").optional(),
    bytes: z.boolean().describe(
        "The original HTTP response body, base64-encoded.",
    ).optional(),
    parse: z.boolean().describe(
        "Fields extracted with custom rules or a prebuilt parser " +
            "(parseParams), returned as parsed.",
    ).optional(),
    highlights: z.boolean().describe(
        "Markdown passages relevant to highlightsParams.query (+1 credit " +
            "when at least one passage returns).",
    ).optional(),
    json: z.boolean().describe(
        "An object matching jsonParams.schema, extracted from the page (+4 " +
            "credits when it succeeds).",
    ).optional(),
    product: z.boolean().describe(
        "Product details such as name, price, and availability (+1 credit " +
            "when it succeeds).",
    ).optional(),
}).strict().describe(
    "The outputs to return; set at least one to true. Each output reports " +
        "requested, success, and data.",
);

const zCustomParser = z.object({
    type: z.literal("custom").describe(
        "Extract fields using custom CSS rules (the default when type is " +
            "omitted).",
    ).optional(),
    rules: z.record(
        z.string(),
        z.union([
            z.string().min(1).max(2048),
            z.record(z.string(), z.any()),
        ]),
    ).describe(
        "Field names mapped to CSS selectors ('h1', 'a@href') or rule " +
            "objects { selector, type: item|list, output }. Max 100 fields, " +
            "5 levels.",
    ),
}).strict();

const zPrebuiltParser = z.object({
    type: z.literal("prebuilt").describe(
        "Use a prebuilt parser instead of custom rules.",
    ),
    parser: z.enum([
        "google-maps",
        "google-maps-reviews",
        "google-play",
        "google-play-reviews",
        "app-store",
        "app-store-reviews",
        "g2-reviews",
        "instagram-profile",
        "instagram-post",
        "instagram-feed",
        "tiktok-profile",
        "tiktok-video",
        "tiktok-feed",
        "tiktok-comments",
        "tiktok-followers",
        "tiktok-following",
        "tiktok-user-search",
        "emails",
        "phone-numbers",
        "links",
    ]).describe(
        "The prebuilt parser to use (docs.context.dev/scrape/prebuilt-parsers " +
            "lists sources and output shapes).",
    ),
    sort: z.enum(["newest", "oldest", "relevant", "highest", "lowest"])
        .describe(
            "google-maps-reviews only. Order of the reviews. Default newest.",
        ).optional(),
    limit: z.number().int().min(1).max(1000).describe(
        "google-maps-reviews only. Maximum reviews to return. Default 100.",
    ).optional(),
}).strict();

const zAction = z.union([
    z.object({
        type: z.literal("perform"),
        action: z.string().min(1).max(500).describe(
            "One plain-language browser instruction, such as clicking a " +
                "button or entering text.",
        ),
    }).strict(),
    z.object({
        type: z.literal("scroll"),
        direction: z.enum(["down", "up", "left", "right"]).describe(
            "Direction to scroll. Default down.",
        ).optional(),
        amount: z.union([
            z.number().int().min(1).max(100000),
            z.enum(["viewport", "max"]),
        ]).describe(
            "Distance per scroll: pixels, one 'viewport' (default), or 'max' " +
                "to reach the end.",
        ).optional(),
        selector: z.string().regex(/\S/).max(2000).describe(
            "Scroll this container. Omit to scroll the page.",
        ).optional(),
        maxScrolls: z.number().int().min(1).max(50).describe(
            "Maximum scroll steps for this action. Default 1.",
        ).optional(),
    }).strict(),
    z.object({
        type: z.literal("wait"),
        milliseconds: z.number().int().min(0).max(30000).describe(
            "Time to pause before the next action.",
        ),
    }).strict(),
    z.object({
        type: z.literal("waitFor"),
        selector: zSelector.describe(
            "CSS selector to wait for before continuing.",
        ),
    }).strict(),
]);

export const zScrapeBody = z.object({
    url: zPageUrl.describe("Public http(s) URL to scrape."),
    formats: zFormats,
    markdownParams: z.object({
        includeLinks: z.boolean().describe(
            "Keep link URLs in the Markdown (html-conversion only). Default " +
                "true.",
        ).optional(),
        includeImages: z.boolean().describe(
            "Include images in the Markdown (html-conversion only). Default " +
                "false.",
        ).optional(),
        inlineImages: z.enum(["placeholder", "preserve"]).describe(
            "How base64 images appear when includeImages is set.",
        ).optional(),
        sourcePreference: z.array(
            z.enum(["html-conversion", "markdown-direct"]),
        ).min(1).describe(
            "Markdown sources in order of preference: html-conversion " +
                "converts the page HTML, markdown-direct uses Markdown the " +
                "site publishes.",
        ).optional(),
    }).strict().describe("Markdown output options.").optional(),
    screenshotParams: z.object({
        area: z.union([
            z.enum(["viewport", "fullPage"]),
            z.object({
                selector: zSelector.describe(
                    "CSS selector matching exactly one visible element.",
                ),
            }).strict(),
            z.object({
                x: z.number().int().min(0).max(100000),
                y: z.number().int().min(0).max(100000),
                width: z.number().int().min(1).max(7680),
                height: z.number().int().min(1).max(100000),
            }).strict().describe("A rectangle in pixels from the origin."),
        ]).describe(
            "What to capture: 'viewport' (default), 'fullPage', one element, " +
                "or a rectangle. Max 40 megapixels.",
        ).optional(),
        format: z.enum(["png", "jpeg", "webp"]).describe(
            "Image format. Default png.",
        ).optional(),
    }).strict().describe("Screenshot output options.").optional(),
    imageParams: z.object({
        enrich: z.array(z.enum(["dimensions", "classification", "file"]))
            .min(1).max(3).describe(
                "Extra data per image: dimensions, classification, or a " +
                    "hosted file URL.",
            ).optional(),
        dedupe: z.enum(["none", "visual"]).describe(
            "Set 'visual' to drop visual duplicates, keeping the largest " +
                "copy. Default none.",
        ).optional(),
    }).strict().describe("Images output options.").optional(),
    parseParams: z.union([zCustomParser, zPrebuiltParser]).describe(
        "Parse output options: custom CSS rules, or a prebuilt parser.",
    ).optional(),
    highlightsParams: z.object({
        query: z.string().min(1).max(2000).describe(
            "The question or topic to find passages for.",
        ),
        maxCharacters: z.number().int().min(100).max(20000).describe(
            "Maximum combined length of returned passages. Default 4000.",
        ).optional(),
    }).strict().describe("Highlights output options.").optional(),
    jsonParams: z.object({
        schema: z.record(z.string(), z.any()).describe(
            "JSON Schema (not an example object) for a top-level object, up " +
                "to 50 KB. Use optional or nullable fields for missing facts.",
        ),
        instructions: z.string().max(2000).describe(
            "Extra guidance, such as which facts to prefer or how to read a " +
                "field.",
        ).optional(),
    }).strict().describe("JSON output options.").optional(),
    productParams: z.object({
        dedupeImages: z.boolean().describe(
            "Drop visually duplicate product images. Default false.",
        ).optional(),
    }).strict().describe("Product output options.").optional(),
    sharedParams: z.object({
        country: z.string().regex(/^[A-Za-z]{2}$/).describe(
            "Proxy country as a two-letter code, such as 'US'.",
        ).optional(),
        headers: z.record(z.string(), z.string().max(8192)).describe(
            "HTTP headers to send to the target site. Requests with headers " +
                "skip the cache.",
        ).optional(),
        viewport: z.object({
            width: z.number().int().min(240).max(7680).optional(),
            height: z.number().int().min(240).max(4320).optional(),
        }).strict().describe(
            "Browser size in pixels. Omit for 1920 x 1080; when given, a " +
                "missing dimension defaults to 1440 x 900.",
        ).optional(),
        theme: z.enum(["light", "dark"]).describe(
            "Emulate a light or dark color scheme.",
        ).optional(),
        dismissCookies: z.boolean().describe(
            "Accept cookie banners before actions and capture. Default true.",
        ).optional(),
        dismissPopups: z.boolean().describe(
            "Close other popups before actions and capture. Default false.",
        ).optional(),
        actions: z.array(zAction).min(1).max(5).describe(
            "Browser steps run in order before capture (perform, scroll, " +
                "wait, waitFor). Requires a paid plan, skips the cache, and " +
                "doubles the base charge to 2 credits.",
        ).optional(),
        waitFor: z.union([
            z.number().int().min(0).max(30000),
            zSelector,
        ]).describe(
            "Milliseconds, or a CSS selector to wait for, after actions. " +
                "Default 500 (2000 with frames or XML).",
        ).optional(),
        settleAnimations: z.boolean().describe(
            "Wait for CSS animations to finish before capture. Defaults to " +
                "true when screenshot is requested.",
        ).optional(),
        mainContentOnly: z.boolean().describe(
            "Keep only the main content. Default false. Doesn't affect " +
                "screenshot, bytes, or product.",
        ).optional(),
        includeSelectors: z.array(zSelector).min(1).max(50).describe(
            "Keep only elements matching these CSS selectors.",
        ).optional(),
        excludeSelectors: z.array(zSelector).min(1).max(50).describe(
            "Remove elements matching these CSS selectors. Overrides " +
                "includeSelectors.",
        ).optional(),
        includeFrames: z.boolean().describe(
            "Include iframe content in HTML and text outputs. Default false.",
        ).optional(),
        parsers: z.object({
            pdf: z.object({
                startPage: z.number().int().min(1).describe(
                    "First page to parse, starting at 1.",
                ).optional(),
                endPage: z.number().int().min(1).describe(
                    "Last page to parse. Must be at least startPage.",
                ).optional(),
                ocr: z.enum(["off", "auto"]).describe(
                    "Set 'auto' to read scanned pages with OCR (+1 credit " +
                        "per recovered page on a fresh fetch). Default off.",
                ).optional(),
            }).strict().optional(),
        }).strict().describe("Document parsing options.").optional(),
    }).strict().describe(
        "Browser and content settings shared by every output.",
    ).optional(),
    maxAgeMs: z.number().int().min(0).max(31536000000).describe(
        "Reuse a cached output younger than this many milliseconds. Default " +
            "259200000 (3 days), max 1 year. Set 0 to always fetch fresh.",
    ).optional(),
    zdr: zZdr.optional(),
    timeoutOpts: z.object({
        milliseconds: z.number().int().min(1).max(300000).describe(
            "Request deadline in milliseconds (max 300000).",
        ),
        behavior: z.enum(["fail", "return-partial"]).describe(
            "'fail' returns 408 at no charge (default); 'return-partial' " +
                "(at least 5000 ms) returns the outputs ready so far and " +
                "bills them.",
        ).optional(),
    }).strict().describe("Request deadline and behavior on timeout.")
        .optional(),
}).strict();
