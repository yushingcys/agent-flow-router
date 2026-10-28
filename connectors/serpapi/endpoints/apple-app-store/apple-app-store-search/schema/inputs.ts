import { z } from "zod";
import { serpApiParams, zDevice } from "../../../../schema/common.ts";

/** `apple_app_store` engine query parameters (https://serpapi.com/apple-app-store,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zAppleAppStoreSearchQuery = z.strictObject({
    term: z.string().min(1).describe(
        "The query you want to search. You can use any search term that you would use in a regular App Store search. (e.g. Coffee)",
    ),
    country: z.string().describe(
        "The country to use for the search. It's a two-letter country code. (e.g., us (default) for the United States, uk for United Kingdom, or fr for France). Head to the Apple Regions for a full list of supported Apple Regions",
    ).optional(),
    lang: z.string().describe(
        "The language to use for the search. It's a four-letter country code. (e.g., en-us (default) for the English, fr-fr for French, or uk-ua for Ukrainian). Head to the Apple Languages for a full list of supported Apple Languages",
    ).optional(),
    num: z.number().describe(
        "The number of results you want to get per each page. It defaults to 10. Maximum number of results you can get per page is 200. Any number greater than maximum number will default to 200.",
    ).optional(),
    disallow_explicit: z.string().describe(
        "The filter for disallowing explicit apps. It defaults to false.",
    ).optional(),
    property: z.string().describe(
        'Parameter allows to search the property of an app. developer allows searching the developer title of an app ( e.g., property=developer and term=Coffee gives apps with "Coffee" in their developer\'s name. (Ex: Coffee Inc.)',
    ).optional(),
    category_id: z.string().describe(
        'Parameter allows to only show app results for a specific category, or genre. E.g. category_id=6014 will only return apps that have "Games" as at least one of their categories, or genres.',
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
