import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `extract` engine query parameters (https://serpapi.com/extract-map-mode,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zExtractMapQuery = z.strictObject({
    url: z.string().min(1).describe(
        "The URL of the page to extract. It must be an absolute http or https URL. Search pages that have a dedicated SerpApi engine, such as Google or Bing, are redirected to that engine.",
    ),
    include_subdomains: z.string().describe(
        "Used with mode=map and mode=crawl. whether to include other subdomains of the same website, e.g. blog.example.com when starting from www.example.com. Default: false (same host only).",
    ).optional(),
    include_sitemap: z.string().describe(
        "Used with mode=map. whether to also read the website's sitemaps, from /sitemap.xml and /robots.txt. Default: true.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
