import { z } from "zod";

/** GET /entities/principals/{entity_id} query parameters. */
export const zLookupQueryParams = z.object({
    field_ids: z.string().describe(
        "Comma-separated fields to return, e.g. 'short_description,website_url,rank'; default is the standard field set.",
    ).optional(),
});
