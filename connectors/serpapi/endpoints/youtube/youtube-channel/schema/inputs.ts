import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `youtube_channel` engine query parameters (https://serpapi.com/youtube-channel-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYoutubeChannelQuery = z.strictObject({
    channel_id: z.string().describe(
        "The YouTube channel identifier. It can be a channel handle found in the URL as youtube.com/@channel_id (e.g., serpapi for youtube.com/@serpapi), or a raw channel ID that starts with UC (e.g., UCUgIHlYBOD3yA3yDIRhg_mg). Requests are faster when a raw channel ID is used.",
    ).optional(),
    gl: z.string().describe(
        "The country to use for the YouTube channel. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France)",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the YouTube channel. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    next_page_token: z.string().describe(
        "The next page token. It is used for retrieving the next page of channel videos. It should be a value of next_page_token from the search results.",
    ).optional(),
    tab: z.string().describe(
        "The channel content tab to retrieve. Available options: videos - Videos (default), returned in videos_results shorts - Shorts, returned in shorts_results streams - Live streams, returned in streams_results podcasts - Podcasts, returned in podcasts_results playlists - Playlists, returned in playlists_results posts - Community posts, returned in posts_results Can't be used together with search_query.",
    ).optional(),
    sort: z.string().describe(
        "The sorting order. Available options depend on tab: videos / shorts / streams: latest - Latest (default) popular - Popular oldest - Oldest playlists: dd - Date added (newest) (default) lad - Last video added sort can't be used with search_query or tab=podcasts or tab=posts.",
    ).optional(),
    search_query: z.string().describe(
        "Parameter is used to search within a channel. Matching videos and playlists are returned in search_results.",
    ).optional(),
    about: z.boolean().describe(
        "Set to true to include additional channel information in channel_results, such as country, joined_date, total_views, and links. This triggers an extra request to YouTube. Defaults to false. about can't be used with next_page_token.",
    ).optional(),
    ...serpApiParams,
});
