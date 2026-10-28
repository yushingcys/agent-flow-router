import { z } from "zod";
import {
    serpApiParams,
    zDevice,
    zGoogleDomain,
    zLocation,
    zUule,
} from "../../../../schema/common.ts";

/** `google` engine query parameters (https://serpapi.com/search-api,
 *  read 2026-10-27). Mirror carries optionality only (D25). */
export const zGoogleSearchQuery = z.strictObject({
    q: z.string().min(1).describe(
        "The query you want to search. You can use anything that you would use in a regular Google search. e.g. inurl:, site:, intitle:. We also support advanced search query parameters such as as_dt and as_eq. See the full list of supported advanced search query parameters. site: can't be used with tbm set to nws.",
    ),
    location: zLocation.optional(),
    uule: zUule.optional(),
    lat: z.number().describe(
        "A GPS latitude for the search origin. Parameter is required when using lon parameter. For consistent results, a matching gl parameter is required. Parameter can't be used together with location and uule parameters.",
    ).optional(),
    lon: z.number().describe(
        "A GPS longitude for the search origin. Parameter is required when using lat parameter. For consistent results, a matching gl parameter is required. Parameter can't be used together with location and uule parameters.",
    ).optional(),
    radius: z.number().describe(
        "The distance (in meters) within which to bias the search results. Results inside of this region will be ranked higher than results outside of it. However, prominent results from outside of the search radius may still be included. Value range per device: - Desktop: 1..199 - Tablet: 1..1000 - Mobile: 1..1000 Parameter can be used alongside location or lat/lon parameters.",
    ).optional(),
    ludocid: z.string().describe(
        "The Google CID (customer identifier) of a place. This parameter can be found in Google Search API and Google Local API local results under the name of place_id, as well as in Google Maps API local results under the name of data_cid. You can also acquire it using Google's CID converter.",
    ).optional(),
    lsig: z.string().describe(
        "Parameter that you might have to use to force the knowledge graph map view to show up. You can find the lsig ID by using our Local Pack API or Google Local API. lsig ID is also available via a redirect Google uses within Google My Business.",
    ).optional(),
    kgmid: z.string().describe(
        "The id (KGMID) of the Google Knowledge Graph listing you want to scrape. Also known as Google Knowledge Graph ID. Searches with kgmid parameter will return results for the originally encrypted search parameters. For some searches, kgmid may override all other parameters except start parameter.",
    ).optional(),
    si: z.string().describe(
        "The cached search parameters of the Google Search you want to scrape. Searches with si parameter will return results for the originally encrypted search parameters. For some searches, si may override all other parameters except startsi can be used to scrape Google Knowledge Graph Tabs.",
    ).optional(),
    ibp: z.string().describe(
        "Parameter is responsible for rendering layouts and expansions for some elements (e.g., gwp;0,7 to expand searches with ludocid for expanded knowledge graph).",
    ).optional(),
    uds: z.string().describe(
        "Parameter enables to filter search. It's a string provided by Google as a filter. uds values are provided under the section: filters with uds, q and serpapi_link values provided for each filter.",
    ).optional(),
    color_scheme: z.string().describe(
        "Parameter forces the selected color scheme to be used on the results page. If the parameter is not set, a random color scheme will be returned. Options: light - Light dark - Dark",
    ).optional(),
    google_domain: zGoogleDomain.optional(),
    gl: z.string().describe(
        "The country to use for the Google search. It's a two-letter country code. (e.g., us for the United States, uk for United Kingdom, or fr for France).",
    ).optional(),
    hl: z.string().describe(
        "The language to use for the Google search. It's a two or three-letter language code. (e.g., en for English, es for Spanish, or fr for French), optionally followed by a two-letter or three-digit region code (e.g., en-gb for British English, or es-419 for Latin American Spanish).",
    ).optional(),
    cr: z.string().describe(
        "One or multiple countries to limit the search to. It uses country{two-letter upper-case country code} to specify countries and | as a delimiter. (e.g., countryFR|countryDE will only search French and German pages).",
    ).optional(),
    lr: z.string().describe(
        "One or multiple languages to limit the search to. It uses lang_{two-letter language code} to specify languages and | as a delimiter. (e.g., lang_fr|lang_de will only search French and German pages).",
    ).optional(),
    tbs: z.string().describe(
        "(to be searched) parameter defines advanced search parameters that aren't possible in the regular query field. (e.g., advanced search for patents, dates, news, videos, images, apps, or text contents).",
    ).optional(),
    safe: z.string().describe(
        "The level of filtering for adult content. It can be set to active or off, by default Google will blur explicit content.",
    ).optional(),
    nfpr: z.string().describe(
        "The exclusion of results from an auto-corrected query when the original query is spelled wrong. It can be set to 1 to exclude these results, or 0 to include them (default). Note that this parameter may not prevent Google from returning results for an auto-corrected query if no other results are available.",
    ).optional(),
    filter: z.string().describe(
        "If the filters for 'Similar Results' and 'Omitted Results' are on or off. It can be set to 1 (default) to enable these filters, or 0 to disable these filters.",
    ).optional(),
    tbm: z.string().describe(
        "(to be matched) parameter defines the type of search you want to do. It can be set to: (no tbm parameter): regular Google Search, isch: Google Images API, lcl: Google Local API, vid: Google Videos API, nws: Google News API, shop: Google Shopping API, pts: Google Patents API, or any other Google service.",
    ).optional(),
    start: z.number().describe(
        "The result offset. It skips the given number of results. It's used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).",
    ).optional(),
    device: zDevice.optional(),
    ...serpApiParams,
});
