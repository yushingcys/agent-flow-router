import { z } from "zod";

/** `{entity_id}` path parameter of every entity / card lookup. */
export const zEntityPathParams = z.object({
    entity_id: z.string().min(1).describe(
        "UUID or permalink of the entity, e.g. 'tesla-motors'.",
    ),
});

/** Card lookup query parameters (`.../cards/{card_id}`). */
export const zCardQueryParams = z.object({
    card_field_ids: z.string().describe(
        'Card fields to include, as a JSON-encoded array string, e.g. \'["identifier","announced_on"]\'.',
    ).optional(),
    order: z.string().describe(
        "Field name with direction, e.g. 'announced_on desc'.",
    ).optional(),
    limit: z.number().int().min(1).max(100).describe(
        "Rows to return, 1-100 (default 100).",
    ).optional(),
    after_id: z.string().uuid().describe(
        "UUID of the last item of the previous page (next page).",
    ).optional(),
    before_id: z.string().uuid().describe(
        "UUID of the first item of the current page (previous page).",
    ).optional(),
});
