import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `youtube_video` engine query parameters (https://serpapi.com/youtube-video-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYoutubeVideoQuery = z.strictObject({
    v: z.string().describe(
        "The Video ID.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the YouTube video. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Youtube video. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page results for related videos, comments or replies. It should be one of - related_videos_next_page_token - comments_next_page_token - comments_sorting_token.token - replies_next_page_token from the search results.",
    ).optional(),
    ...serpApiParams,
});
