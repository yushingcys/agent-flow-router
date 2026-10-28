import { z } from "zod";

/** Akta /v1/news/by-id query params. An ARRAY in the schema; the provider
 *  toRequest renders it comma-separated. */
export const zNewsByIdQueryParams = z.object({
    news_ids: z.array(z.string().min(1)).min(1).describe(
        "News article ids to fetch - the 'id' field of articles returned " +
            "by the Akta News endpoint. Comma-separated on the wire.",
    ),
}).strict();
