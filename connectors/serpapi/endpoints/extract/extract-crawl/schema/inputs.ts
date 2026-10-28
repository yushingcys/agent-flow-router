import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `extract` engine query parameters (https://serpapi.com/extract-crawl-mode,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zExtractCrawlQuery = z.strictObject({
    url: z.string().min(1).describe(
        "The URL of the page to extract. It must be an absolute http or https URL. Search pages that have a dedicated SerpApi engine, such as Google or Bing, are redirected to that engine.",
    ),
    max_pages: z.number().describe(
        "Used with mode=crawl. the maximum number of pages to extract, including the starting page. Default: 10. Maximum: 100. Each successfully extracted page consumes one search credit.",
    ).optional(),
    max_depth: z.number().describe(
        "Used with mode=crawl. how many links deep the crawl follows from the starting page. 0 extracts only the starting page. Default: 2. Maximum: 3.",
    ).optional(),
    include_subdomains: z.string().describe(
        "Used with mode=map and mode=crawl. whether to include other subdomains of the same website, e.g. blog.example.com when starting from www.example.com. Default: false (same host only).",
    ).optional(),
    prefetch_delay: z.number().describe(
        "A delay in milliseconds before the first page is fetched (0–10,000). Default: 0. The Extract API doesn't run JavaScript, so this is not a rendering delay.",
    ).optional(),
    timeout: z.number().describe(
        "The HTTP request timeout in milliseconds (1,000–120,000). Default: 30,000 (30 seconds).",
    ).optional(),
    include_tags: z.string().describe(
        "A comma-separated list of CSS selectors to keep, e.g. article, main, .post-content. Everything else inside <body> is removed before parsing.",
    ).optional(),
    exclude_tags: z.string().describe(
        "A comma-separated list of CSS selectors to remove before parsing, e.g. nav, footer, .ads, #cookie-banner.",
    ).optional(),
    include_markdown: z.string().describe(
        "Whether to add the page's main content as Markdown in text_content.markdown. Default: false.",
    ).optional(),
    include_inline_assets: z.string().describe(
        "Whether to include inline <style> and <script> blocks, with their content, in stylesheets and scripts. Default: false.",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
