import { z } from "zod";

/** POST /v1/search body - docs.browserbase.com reference/api/web-search
 *  (read 2026-10-27). Optionality and vendor bounds only (D25). */
export const zBrowserbaseSearchBody = z.looseObject({
    query: z.string().min(1).max(200).describe("The search query."),
    numResults: z.number().int().min(1).max(25).describe(
        "Number of results to return (1-25, vendor default 10).",
    ).optional(),
    provider: z.enum(["parallel", "exa"]).describe(
        "Search provider; omit for the project's default (parallel).",
    ).optional(),
    mode: z.enum(["fast", "advanced", "deep-lite", "deep"]).describe(
        "Provider mode, accepted only together with `provider`: parallel " +
            "offers fast and advanced (default), exa offers fast (default), " +
            "deep-lite and deep. A mode the provider lacks is a 400.",
    ).optional(),
});
