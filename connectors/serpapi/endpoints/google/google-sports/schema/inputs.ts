import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `google_sports` engine query parameters (https://serpapi.com/google-sports-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleSportsQuery = z.strictObject({
    kgmid: z.string().min(1).describe(
        'The Google Knowledge Graph ID of the selected entity type. It can be found in Google Search API, Google Sports API, or on Wikidata as "Freebase ID".',
    ),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    mpd: z.string().describe(
        "The middle time of the league and team games. Games before and after the specified time will be returned. Format (ISO8601 UTC): YYYY-MM-DDTHH:mm:ssZ Example: 2026-05-29T12:30:00Z Parameter cannot be used with moa and mob parameters.",
    ).optional(),
    moa: z.string().describe(
        "The earliest time of the league and team games. Games after the specified time will be returned. Format (ISO8601 UTC): YYYY-MM-DDTHH:mm:ssZ Example: 2026-05-29T12:30:00Z Parameter cannot be used with mpd parameter. Parameter can be used with mob parameter, but should not be later.",
    ).optional(),
    mob: z.string().describe(
        "The latest time of the league and team games. Games before the specified time will be returned. Format (ISO8601 UTC): YYYY-MM-DDTHH:mm:ssZ Example: 2026-05-29T12:30:00Z Parameter cannot be used with mpd parameter. Parameter can be used with moa parameter, but should not be earlier.",
    ).optional(),
    season_kgmid: z.string().describe(
        'The Google Knowledge Graph ID of the specific standings season and should be used alongside the main league or team kgmid. Available seasons can be found in Google Sports API standings results or on Wikidata as "Freebase ID". Parameter can be used as a standalone kgmid parameter to fetch tabs other than standings.',
    ).optional(),
    sp: z.string().min(1).describe(
        "The sport of the selected entity type. Options: ft - Football bs - Basketball bb - Baseball cr - Cricket af - American football ih - Ice hockey rg - Rugby",
    ),
    type: z.string().min(1).describe(
        "The entity type. Options: game - Game league - League team - Team",
    ),
    tab: z.string().describe(
        "The tab on the page of the selected entity type. Options: gm - League/Team - Games sn - League/Team - Standings pl - League/Team - Players br - League/Team - Brackets st - League - Stats rn - League - Rankings ov - Game - Overview (American football) Parameter is required for league and team entity type. Parameter is optional for game entity type and should be used only with American football sp value.",
    ).optional(),
    ...serpApiParams,
});
