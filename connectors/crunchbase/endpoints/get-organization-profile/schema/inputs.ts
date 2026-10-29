import { z } from "zod";

/** GET /entities/organizations/{entity_id} query parameters. */
export const zLookupQueryParams = z.object({
    field_ids: z.string().describe(
        "Comma-separated fields to return, e.g. 'short_description,website_url,rank'; default is the standard field set.",
    ).optional(),
    card_ids: z.string().describe(
        "Comma-separated relationship cards to include, e.g. 'founders,raised_funding_rounds,investors'.",
    ).optional(),
});
