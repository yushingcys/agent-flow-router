import { z } from "zod";
import { serpApiParams } from "../../../../schema/common.ts";

/** `yandex` engine query parameters (https://serpapi.com/yandex-search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zYandexSearchQuery = z.strictObject({
    text: z.string().min(1).describe(
        "The search query. You can use anything that you would use in a regular Yandex search. It can be 400 characters at maximum. Yandex usually accepts first 40 words of the query.",
    ),
    yandex_domain: z.string().describe(
        "The Yandex domain to use. It defaults to yandex.com. A default lr is used for each yandex_domain. Example: 84(US) for yandex.com A default lang parameter en(English) is used for yandex.com",
    ).optional(),
    lang: z.string().describe(
        "The language to use for the Yandex search. It defaults to en when yandex_domain is yandex.com.",
    ).optional(),
    lr: z.string().describe(
        "Country or region ID to limit the search results to. If parameter is not set - the matching location of selected yandex_domain is used, e.g. 84 for yandex.com.",
    ).optional(),
    family_mode: z.string().describe(
        "Parameter enables or disables Family Mode (safe search). It can be set to: - Off(0) - Moderate(1) - Strict(2). It defaults to Moderate(1).",
    ).optional(),
    fix_typo: z.boolean().describe(
        "Parameter enables or disables automatic spelling correction. It can be set to: true - false. It defaults to true.",
    ).optional(),
    groups_on_page: z.number().describe(
        "The maximum number of groups displayed on a single results page. It defaults to 20.",
    ).optional(),
    sort_mode: z.string().describe(
        "The sorting mode of search results. It can be set to: relevance - by relevance (default) date - by date.",
    ).optional(),
    period: z.string().describe(
        "The time period for search results. It can be set to: all - all time (Default) day - last day last_two_weeks - last two weeks month - last month",
    ).optional(),
    p: z.number().describe(
        "Page number. Pagination starts from 0.",
    ).optional(),
    ...serpApiParams,
});
