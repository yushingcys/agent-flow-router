import { z } from "zod";
import { zDomain, zZdr } from "../../../schema/common.ts";

/** GET /web/urls query params - the vendor mirror
 *  (docs.context.dev/api-reference/web-scraping/map, 2026-10-27), scalar
 *  params only: `headers` and `timeoutOpts` are deep-object query params
 *  the engine cannot send (design D6). */
export const zWebUrlsQueryParams = z.object({
    domain: zDomain.describe("Domain to map, e.g. 'stripe.com'."),
    includeSubdomains: z.boolean().describe(
        "Also include URLs on subdomains of the domain. Default false.",
    ).optional(),
    maxLinks: z.number().int().min(1).max(100000).describe(
        "Maximum number of URLs to return. Default 10000, max 100000.",
    ).optional(),
    sitemapUrl: z.string().regex(/^https?:\/\/\S+$/).describe(
        "Fetch this sitemap instead of discovering the domain's sitemaps. " +
            "Must belong to the domain or a subdomain.",
    ).optional(),
    urlRegex: z.string().max(256).describe(
        "Regex pattern. Only matching URLs are returned and counted against " +
            "maxLinks.",
    ).optional(),
    excludeUrlRegex: z.string().max(256).describe(
        "Regex pattern. Matching URLs are dropped, even when they match " +
            "urlRegex.",
    ).optional(),
    search: z.string().min(2).max(200).describe(
        "Topic or phrase: the URLs are filtered to the pages about it, most " +
            "relevant first (matched across site languages). A searched map " +
            "costs 2 credits instead of 1.",
    ).optional(),
    zdr: zZdr.optional(),
}).strict();
