import { z } from "zod";

/** AnyAPI's context-budget controls, shared by every `/v1/run/{sku}`.
 *  They shape the returned `output` only; the charge is unchanged. */
export const zQuery = z.strictObject({
    jq: z.string().min(1).describe(
        "A jq expression run against the result; its output replaces " +
            "`output` (several outputs collect into an array), for example " +
            "`.data | {title, md: .markdown[:3500]}`. On failure the full " +
            "result comes back with a `jqError`. Does not change cost.",
    ).optional(),
    fields: z.string().min(1).describe(
        "Comma-separated keys (dotted paths allowed) to keep on each " +
            "result item, relative to the item rather than the envelope. " +
            "Does not change cost.",
    ).optional(),
    max_items: z.number().int().min(0).describe(
        "Cap the number of result rows returned; a `_truncated` note " +
            "reports how many were withheld. Does not change cost.",
    ).optional(),
    summary: z.boolean().describe(
        "Return only a structural outline (top-level keys, item counts, " +
            "per-field byte sizes) instead of the data. Does not change cost.",
    ).optional(),
});
