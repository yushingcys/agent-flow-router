import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google_reverse_image` engine query parameters (https://serpapi.com/google-reverse-image,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleReverseImageQuery = z.strictObject({
    q: z.string().describe(
        "The query you want to search. You can also include location in a query as location parameter doesn't work for this kind of search.",
    ).optional(),
    location: zLocation.optional(),
    uule: zUule.optional(),
    google_domain: zGoogleDomain.optional(),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Reverse Image search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    lr: z.string().describe(
        "One or multiple languages to limit the search to. It uses lang_{two-letter language code} to specify languages and | as a delimiter. (e.g., lang_fr|lang_de will only search French and German pages).",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    image_url: z.string().min(1).describe(
        "URL for an image to perform reverse search.",
    ),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content.",
    ).optional(),
    tbs: z.string().describe(
        "(to be searched) parameter defines advanced search parameters that aren't possible in the regular query field. (e.g., advanced search for dates, size, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
