import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_images_related_content` engine query parameters (https://serpapi.com/google-images-related-content-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleImagesRelatedQuery = z.strictObject({
    related_content_id: z.string().min(1).describe(
        "The unique ID for retrieving the Related Content of an image. You can acquire the ID by using our Google Images API.",
    ),
    q: z.string().describe(
        "The search query. To get the most precise results it is recommended to use the same query you used in the original Google Images search.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Images search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Images search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    ...serpApiParams,
});
