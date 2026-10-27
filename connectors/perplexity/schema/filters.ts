import { z } from "zod";

/**
 * Search filters shared by the Agent API's web_search tool and the Search
 * API (`SearchDomainFilter` + `DateFilters` in
 * https://docs.perplexity.ai/openapi.json). Optionality only (D25).
 */

const zDate = (what: string) =>
    z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/).describe(
        `Return results ${what} this date, as MM/DD/YYYY.`,
    );

export const zFilterFields = {
    search_domain_filter: z.array(z.string().max(253)).max(20).describe(
        "Domains or URLs to search (allowlist), or to exclude when " +
            "prefixed with '-' (denylist). Up to 20; use one mode per request.",
    ).optional(),
    search_recency_filter: z.enum(["hour", "day", "week", "month", "year"])
        .describe("Only results published within this window.").optional(),
    search_after_date_filter: zDate("published after").optional(),
    search_before_date_filter: zDate("published before").optional(),
    last_updated_after_filter: zDate("last updated after").optional(),
    last_updated_before_filter: zDate("last updated before").optional(),
};
