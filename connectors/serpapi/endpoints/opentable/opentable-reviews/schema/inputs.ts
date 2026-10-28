import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `open_table_reviews` engine query parameters (https://serpapi.com/open-table-reviews-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zOpentableReviewsQuery = z.strictObject({
    rid: z.string().min(1).describe(
        "The OpenTable Restaurant ID. This identifier can be found in the URL of the restaurant's page, it's the path of the URL (the part after the first singular /). For example, in the URL https://www.opentable.com/r/central-park-boathouse-new-york-2, the Restaurant ID is r/central-park-boathouse-new-york-2.",
    ),
    page: z.number().describe(
        "The page number. 1 (default) is the first page of 10 results, 2 is the 2nd page, etc.",
    ).optional(),
    ...serpApiParams,
});
