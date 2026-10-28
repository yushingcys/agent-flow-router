import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_play_movies` engine query parameters (https://serpapi.com/google-play-movies,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGooglePlayMoviesQuery = z.strictObject({
    q: z.string().describe(
        "The query you want to search in Google Play Movies Store.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the Google Play search. It's a two-letter country code. (e.g., us (default) for the United States, uk for United Kingdom, or fr for France). You can find the full list of Google Play country availability here: Google Play Countries. Afterwards, head to the Google countries page for a two-letter country code.",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google Play search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    movies_category: z.string().describe(
        "The movies store category. See the Google Play Store's movie categories for a full list.",
    ).optional(),
    age: z.string().describe(
        "Age subcategory. age works, and should only be used with movies_category=FAMILY (Family Movies) It can be set to: AGE_RANGE1 - Ages up to 5 AGE_RANGE2 - Ages 6-8 AGE_RANGE3 - Ages 9-12 The default value for age is: - All ages up to 12",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results. It shouldn't be used with the section_page_token, see_more_token, and chart parameters.",
    ).optional(),
    section_page_token: z.string().describe(
        "The section page token used for retrieving the pagination results from individual sections. This parameter is a safer version of see_more_token, and is found in every row you can paginate into. It shouldn't be used with the next_page_token, see_more_token, and chart parameters",
    ).optional(),
    chart: z.string().describe(
        "Showing top charts. It can return up to 50 results. Each store contains different charts which require different values for retrieving results. To get the value of a specific chart you can use our Google Play Movies Store API JSON output: chart_options[index].value (e.g. chart=topselling_free). It shouldn't be used with the section_page_token, see_more_token, and next_page_token parameters",
    ).optional(),
    see_more_token: z.string().describe(
        "The see more token used for retrieving the pagination results from individual sections It is usually found in next page results. It shouldn't be used with the section_page_token, next_page_token, and chart, parameters",
    ).optional(),
    ...serpApiParams,
});
