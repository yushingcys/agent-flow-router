import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `youtube` engine query parameters (https://serpapi.com/youtube-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYoutubeSearchQuery = z.strictObject({
    search_query: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular YouTube search.",
    ),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Youtube search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    sp: z.string().describe(
        "Parameter can be used for pagination. YouTube uses continuous pagination and the next page token can be found in the SerpApi JSON response serpapi_pagination -> next_page_token and pagination -> next_page_token fields. Parameter can also be used to filter the search results: by Upload date, you need to set the sp parameter to CAI%3D by 4K, you need to set the sp parameter to EgJwAQ%3D%3D ...",
    ).optional(),
    ...serpApiParams,
});
