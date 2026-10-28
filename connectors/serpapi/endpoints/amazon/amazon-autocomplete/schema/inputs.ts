import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `amazon_autocomplete` engine query parameters (https://serpapi.com/amazon-autocomplete-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAmazonAutocompleteQuery = z.strictObject({
    k: z.string().min(1).describe(
        "The search query. A query that would be used to provide completion options on Amazon.",
    ),
    amazon_domain: z.string().describe(
        "The Amazon domain to use. It defaults to amazon.com. Head to Amazon domains for a full list of supported Amazon domains.",
    ).optional(),
    amazon_department: z.string().describe(
        "The Amazon department to scope suggestions to. Defaults to aps (All Departments). Head to Amazon departments for a full list of supported Amazon departments.",
    ).optional(),
    ...serpApiParams,
});
