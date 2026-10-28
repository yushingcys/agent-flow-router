import { z } from "zod";

/**
 * Query parameters every SerpApi engine shares, or that keep one meaning
 * wherever they appear (serpapi.com/search-api and each engine page, read
 * 2026-10-27). Mirror carries optionality only (D25).
 */

/** The engine an endpoint runs, bound at the endpoint (not a mirror field:
 *  SerpApi's `engine` is required, and each endpoint is one engine). */
export const zEngine = <E extends string>(engine: E) =>
    z.literal(engine).default(engine).describe(
        `SerpApi engine. Fixed to ${engine} for this endpoint.`,
    );

export const zNoCache = z.boolean().describe(
    "Fetch fresh results even if a cached copy exists (vendor default " +
        "false). A cache entry is served only for identical parameters, " +
        "expires after 1 hour, and costs nothing. Cannot be combined with " +
        "async.",
);

export const zZeroTrace = z.boolean().describe(
    "Enterprise only. Skip storing search parameters, files, and " +
        "metadata on SerpApi's servers (vendor default false).",
);

export const zJsonRestrictor = z.string().describe(
    "Only include these fields in the output, e.g. " +
        "`organic_results[0:3].{title,link}` (SerpApi JSON Restrictor " +
        "syntax). Shrinks the payload.",
);

/** The trailing SerpApi parameters every engine accepts. */
export const serpApiParams = {
    no_cache: zNoCache.optional(),
    zero_trace: zZeroTrace.optional(),
    json_restrictor: zJsonRestrictor.optional(),
};

export const zDevice = z.string().describe(
    "Device to search as: desktop (vendor default), tablet, or mobile.",
);

export const zGoogleDomain = z.string().describe(
    "Google domain to use, e.g. google.com (vendor default), google.co.uk.",
);

export const zLocation = z.string().describe(
    "Where the search should originate, as a canonical location name " +
        "(see serpapi#locations), e.g. Austin, Texas, United States.",
);

export const zUule = z.string().describe(
    "Google-encoded location to search from. Cannot be combined with " +
        "location.",
);
