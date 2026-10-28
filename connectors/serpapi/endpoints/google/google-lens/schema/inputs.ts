import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_lens` engine query parameters (https://serpapi.com/google-lens-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleLensQuery = z.strictObject({
    url: z.string().min(1).describe(
        "The URL of an image to perform the Google Lens search. Alternatively, you can use image_id parameter if you prefer to perform a search by uploading an image.",
    ),
    hl: z.string().describe(
        "The language to use for the Google Lens search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    country: z.string().describe(
        "The specific country location to use for the Google Lens search. It's a two-letter country code. (e.g., us for United States, fr for France, or de for Germany).",
    ).optional(),
    type: z.string().min(1).describe(
        "The type of search to perform. By default, the search type is all. Available options: all - All exact_matches - Exact Matches visual_matches - Visual Matches.",
    ),
    q: z.string().describe(
        "The search query to use along in the Google Lens search. It is only applicable when type is set to all or visual_matches.",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content.",
    ).optional(),
    auto_crop: z.boolean().describe(
        "Whether Google auto-crops the image to focus on the detected area of interest. It can be set to true or false (default).",
    ).optional(),
    image_id: z.string().describe(
        "The Image ID you want to use for the search. The Image ID can be obtained using the Image API. When using the image_id parameter, the url parameter can be omitted. Visit the documentation for the step-by-step guide.",
    ).optional(),
    ...serpApiParams,
});
